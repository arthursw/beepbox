// Copyright (C) 2020 John Nesky, distributed under the MIT license.
// A basic FFT operation scales the overall magnitude of elements by the
// square root of the length of the array, √N. Performing a forward FFT and
// then an inverse FFT results in the original array, but multiplied by N.
// This helper function can be used to compensate for that. 
function scaleElementsByFactor(array, factor) {
    for (var i = 0; i < array.length; i++) {
        array[i] *= factor;
    }
}
exports.scaleElementsByFactor = scaleElementsByFactor;
function isPowerOf2(n) {
    return !!n && !(n & (n - 1));
}
function countBits(n) {
    if (!isPowerOf2(n))
        throw new Error("FFT array length must be a power of 2.");
    return Math.round(Math.log(n) / Math.log(2));
}
// Rearranges the elements of the array, swapping the element at an index
// with an element at an index that is the bitwise reverse of the first
// index in base 2. Useful for computing the FFT.
function reverseIndexBits(array, fullArrayLength) {
    var bitCount = countBits(fullArrayLength);
    if (bitCount > 16)
        throw new Error("FFT array length must not be greater than 2^16.");
    var finalShift = 16 - bitCount;
    for (var i = 0; i < fullArrayLength; i++) {
        // Dear Javascript: Please support bit order reversal intrinsics. Thanks! :D
        var j = void 0;
        j = ((i & 0xaaaa) >> 1) | ((i & 0x5555) << 1);
        j = ((j & 0xcccc) >> 2) | ((j & 0x3333) << 2);
        j = ((j & 0xf0f0) >> 4) | ((j & 0x0f0f) << 4);
        j = ((j >> 8) | ((j & 0xff) << 8)) >> finalShift;
        if (j > i) {
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }
}
// Provided for educational purposes. Easier to read than
// fastFourierTransform(), but computes the same result.
// Takes two parallel arrays representing the real and imaginary elements,
// respectively, and returns an array containing two new arrays, which
// contain the complex result of the transform.
function discreteFourierTransform(realArray, imagArray) {
    var fullArrayLength = realArray.length;
    if (fullArrayLength != imagArray.length)
        throw new Error("FFT arrays must be the same length.");
    var realOut = [];
    var imagOut = [];
    for (var i = 0; i < fullArrayLength; i++) {
        realOut[i] = 0.0;
        imagOut[i] = 0.0;
        for (var j = 0; j < fullArrayLength; j++) {
            var radians = -6.2831853 * j * i / fullArrayLength;
            var c = Math.cos(radians);
            var s = Math.sin(radians);
            realOut[i] += realArray[j] * c - imagArray[j] * s;
            imagOut[i] += realArray[j] * s + imagArray[j] * c;
        }
    }
    return [realOut, imagOut];
}
exports.discreteFourierTransform = discreteFourierTransform;
// Performs a Fourier transform in O(N log(N)) operations. Overwrites the
// input real and imaginary arrays. Can be used for both forward and inverse
// transforms: swap the order of the arguments for the inverse.
function fastFourierTransform(realArray, imagArray) {
    var fullArrayLength = realArray.length;
    if (!isPowerOf2(fullArrayLength))
        throw new Error("FFT array length must be a power of 2.");
    if (fullArrayLength < 4)
        throw new Error("FFT array length must be at least 4.");
    if (fullArrayLength != imagArray.length)
        throw new Error("FFT arrays must be the same length.");
    reverseIndexBits(realArray, fullArrayLength);
    reverseIndexBits(imagArray, fullArrayLength);
    // First two passes, with strides of 2 and 4, can be combined and optimized.
    for (var startIndex = 0; startIndex < fullArrayLength; startIndex += 4) {
        var startIndex1 = startIndex + 1;
        var startIndex2 = startIndex + 2;
        var startIndex3 = startIndex + 3;
        var real0 = realArray[startIndex];
        var real1 = realArray[startIndex1];
        var real2 = realArray[startIndex2];
        var real3 = realArray[startIndex3];
        var imag0 = imagArray[startIndex];
        var imag1 = imagArray[startIndex1];
        var imag2 = imagArray[startIndex2];
        var imag3 = imagArray[startIndex3];
        var realTemp0 = real0 + real1;
        var realTemp1 = real0 - real1;
        var realTemp2 = real2 + real3;
        var realTemp3 = real2 - real3;
        var imagTemp0 = imag0 + imag1;
        var imagTemp1 = imag0 - imag1;
        var imagTemp2 = imag2 + imag3;
        var imagTemp3 = imag2 - imag3;
        realArray[startIndex] = realTemp0 + realTemp2;
        realArray[startIndex1] = realTemp1 + imagTemp3;
        realArray[startIndex2] = realTemp0 - realTemp2;
        realArray[startIndex3] = realTemp1 - imagTemp3;
        imagArray[startIndex] = imagTemp0 + imagTemp2;
        imagArray[startIndex1] = imagTemp1 - realTemp3;
        imagArray[startIndex2] = imagTemp0 - imagTemp2;
        imagArray[startIndex3] = imagTemp1 + realTemp3;
    }
    for (var stride = 8; stride <= fullArrayLength; stride += stride) {
        var halfLength = stride >>> 1;
        var radiansIncrement = Math.PI * 2.0 / stride;
        var cosIncrement = Math.cos(radiansIncrement);
        var sinIncrement = Math.sin(radiansIncrement);
        var oscillatorMultiplier = 2.0 * cosIncrement;
        for (var startIndex = 0; startIndex < fullArrayLength; startIndex += stride) {
            var c = 1.0;
            var s = 0.0;
            var cPrev = cosIncrement;
            var sPrev = sinIncrement;
            var secondHalf = startIndex + halfLength;
            for (var i = startIndex; i < secondHalf; i++) {
                var j = i + halfLength;
                var real0 = realArray[i];
                var imag0 = imagArray[i];
                var real1 = realArray[j] * c - imagArray[j] * s;
                var imag1 = realArray[j] * s + imagArray[j] * c;
                realArray[i] = real0 + real1;
                imagArray[i] = imag0 + imag1;
                realArray[j] = real0 - real1;
                imagArray[j] = imag0 - imag1;
                var cTemp = oscillatorMultiplier * c - cPrev;
                var sTemp = oscillatorMultiplier * s - sPrev;
                cPrev = c;
                sPrev = s;
                c = cTemp;
                s = sTemp;
            }
        }
    }
}
exports.fastFourierTransform = fastFourierTransform;
// Computes the Fourier transform from an array of real-valued time-domain
// samples. The output is specially formatted for space efficieny: elements
// 0 through N/2 represent cosine wave amplitudes in ascending frequency,
// and elements N/2+1 through N-1 represent sine wave amplitudes in
// descending frequency. Overwrites the input array.
function forwardRealFourierTransform(array) {
    var fullArrayLength = array.length;
    var totalPasses = countBits(fullArrayLength);
    if (fullArrayLength < 4)
        throw new Error("FFT array length must be at least 4.");
    reverseIndexBits(array, fullArrayLength);
    // First and second pass.
    for (var index = 0; index < fullArrayLength; index += 4) {
        var index1 = index + 1;
        var index2 = index + 2;
        var index3 = index + 3;
        var real0 = array[index];
        var real1 = array[index1];
        var real2 = array[index2];
        var real3 = array[index3];
        // no imaginary elements yet since the input is fully real.
        var tempA = real0 + real1;
        var tempB = real2 + real3;
        array[index] = tempA + tempB;
        array[index1] = real0 - real1;
        array[index2] = tempA - tempB;
        array[index3] = real2 - real3;
    }
    // Third pass.
    var sqrt2over2 = Math.sqrt(2.0) / 2.0;
    for (var index = 0; index < fullArrayLength; index += 8) {
        var index1 = index + 1;
        var index3 = index + 3;
        var index4 = index + 4;
        var index5 = index + 5;
        var index7 = index + 7;
        var real0 = array[index];
        var real1 = array[index1];
        var imag3 = array[index3];
        var real4 = array[index4];
        var real5 = array[index5];
        var imag7 = array[index7];
        var tempA = (real5 - imag7) * sqrt2over2;
        var tempB = (real5 + imag7) * sqrt2over2;
        array[index] = real0 + real4;
        array[index1] = real1 + tempA;
        array[index3] = real1 - tempA;
        array[index4] = real0 - real4;
        array[index5] = tempB - imag3;
        array[index7] = tempB + imag3;
    }
    // Handle remaining passes.
    for (var pass = 3; pass < totalPasses; pass++) {
        var subStride = 1 << pass;
        var midSubStride = subStride >> 1;
        var stride = subStride << 1;
        var radiansIncrement = Math.PI * 2.0 / stride;
        var cosIncrement = Math.cos(radiansIncrement);
        var sinIncrement = Math.sin(radiansIncrement);
        var oscillatorMultiplier = 2.0 * cosIncrement;
        for (var startIndex = 0; startIndex < fullArrayLength; startIndex += stride) {
            var startIndexA = startIndex;
            var startIndexB = startIndexA + subStride;
            var stopIndex = startIndexB + subStride;
            var realStartA = array[startIndexA];
            var realStartB = array[startIndexB];
            array[startIndexA] = realStartA + realStartB;
            array[startIndexB] = realStartA - realStartB;
            var c = cosIncrement;
            var s = -sinIncrement;
            var cPrev = 1.0;
            var sPrev = 0.0;
            for (var index = 1; index < midSubStride; index++) {
                var indexA0 = startIndexA + index;
                var indexA1 = startIndexB - index;
                var indexB0 = startIndexB + index;
                var indexB1 = stopIndex - index;
                var real0 = array[indexA0];
                var imag0 = array[indexA1];
                var real1 = array[indexB0];
                var imag1 = array[indexB1];
                var tempA = real1 * c + imag1 * s;
                var tempB = real1 * s - imag1 * c;
                array[indexA0] = real0 + tempA;
                array[indexA1] = real0 - tempA;
                array[indexB0] = -imag0 - tempB;
                array[indexB1] = imag0 - tempB;
                var cTemp = oscillatorMultiplier * c - cPrev;
                var sTemp = oscillatorMultiplier * s - sPrev;
                cPrev = c;
                sPrev = s;
                c = cTemp;
                s = sTemp;
            }
        }
    }
}
exports.forwardRealFourierTransform = forwardRealFourierTransform;
// Computes the inverse Fourier transform from a specially formatted array of
// scalar values. Elements 0 through N/2 are expected to be the real values of
// the corresponding complex elements, representing cosine wave amplitudes in
// ascending frequency, and elements N/2+1 through N-1 correspond to the
// imaginary values, representing sine wave amplitudes in descending frequency.
// Generates real-valued time-domain samples. Overwrites the input array.
function inverseRealFourierTransform(array, fullArrayLength) {
    var totalPasses = countBits(fullArrayLength);
    if (fullArrayLength < 4)
        throw new Error("FFT array length must be at least 4.");
    // Perform all but the last few passes in reverse.
    for (var pass = totalPasses - 1; pass >= 2; pass--) {
        var subStride = 1 << pass;
        var midSubStride = subStride >> 1;
        var stride = subStride << 1;
        var radiansIncrement = Math.PI * 2.0 / stride;
        var cosIncrement = Math.cos(radiansIncrement);
        var sinIncrement = Math.sin(radiansIncrement);
        var oscillatorMultiplier = 2.0 * cosIncrement;
        for (var startIndex = 0; startIndex < fullArrayLength; startIndex += stride) {
            var startIndexA = startIndex;
            var midIndexA = startIndexA + midSubStride;
            var startIndexB = startIndexA + subStride;
            var midIndexB = startIndexB + midSubStride;
            var stopIndex = startIndexB + subStride;
            var realStartA = array[startIndexA];
            var imagStartB = array[startIndexB];
            array[startIndexA] = realStartA + imagStartB;
            array[midIndexA] *= 2;
            array[startIndexB] = realStartA - imagStartB;
            array[midIndexB] *= 2;
            var c = cosIncrement;
            var s = -sinIncrement;
            var cPrev = 1.0;
            var sPrev = 0.0;
            for (var index = 1; index < midSubStride; index++) {
                var indexA0 = startIndexA + index;
                var indexA1 = startIndexB - index;
                var indexB0 = startIndexB + index;
                var indexB1 = stopIndex - index;
                var real0 = array[indexA0];
                var real1 = array[indexA1];
                var imag0 = array[indexB0];
                var imag1 = array[indexB1];
                var tempA = real0 - real1;
                var tempB = imag0 + imag1;
                array[indexA0] = real0 + real1;
                array[indexA1] = imag1 - imag0;
                array[indexB0] = tempA * c - tempB * s;
                array[indexB1] = tempB * c + tempA * s;
                var cTemp = oscillatorMultiplier * c - cPrev;
                var sTemp = oscillatorMultiplier * s - sPrev;
                cPrev = c;
                sPrev = s;
                c = cTemp;
                s = sTemp;
            }
        }
    }
    /*
    // Commented out this block (and compensated with an extra pass above)
    // because it's slower in my testing so far.
    // Pass with stride 8.
    const sqrt2over2: number = Math.sqrt(2.0) / 2.0;
    for (let index: number = 0; index < fullArrayLength; index += 8) {
        const index1: number = index + 1;
        const index2: number = index + 2;
        const index3: number = index + 3;
        const index4: number = index + 4;
        const index5: number = index + 5;
        const index6: number = index + 6;
        const index7: number = index + 7;
        const real0: number = array[index ];
        const real1: number = array[index1];
        const real2: number = array[index2];
        const real3: number = array[index3];
        const imag4: number = array[index4];
        const imag5: number = array[index5];
        const imag6: number = array[index6];
        const imag7: number = array[index7];
        const tempA: number = real1 - real3;
        const tempB: number = imag5 + imag7;
        array[index ] = real0 + imag4;
        array[index1] = real1 + real3;
        array[index2] = real2 * 2;
        array[index3] = imag7 - imag5;
        array[index4] = real0 - imag4;
        array[index5] = (tempA + tempB) * sqrt2over2;
        array[index6] = imag6 * 2;
        array[index7] = (tempB - tempA) * sqrt2over2;
    }
    */
    // The final passes with strides 4 and 2, combined into one loop.
    for (var index = 0; index < fullArrayLength; index += 4) {
        var index1 = index + 1;
        var index2 = index + 2;
        var index3 = index + 3;
        var real0 = array[index];
        var real1 = array[index1] * 2;
        var imag2 = array[index2];
        var imag3 = array[index3] * 2;
        var tempA = real0 + imag2;
        var tempB = real0 - imag2;
        array[index] = tempA + real1;
        array[index1] = tempA - real1;
        array[index2] = tempB + imag3;
        array[index3] = tempB - imag3;
    }
    reverseIndexBits(array, fullArrayLength);
}
exports.inverseRealFourierTransform = inverseRealFourierTransform;
//}
