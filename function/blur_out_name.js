// Javascript string is immutable.
module.exports = function(name) {
    const mosaicCharacter = 'x';
    switch(name.length) {

        //한글이름 2~4자, 물론 4자 이하의 영문이름으로 가입해도 공통적으로 적용됨
        case 2 :
            return name.charAt(0) + mosaicCharacter;
            break;
        case 3 :
            return name.charAt(0) + mosaicCharacter + name.charAt(2);
            break;
        case 4 :
            return name.charAt(0) + "XX" + name.charAt(3);
            break;
        //    그 이상은 영문이름
        default :
            //String.prototype.replaceAll called with a non-global RegExp argument
            // https://developer.mozilla.org/ko/docs/Web/JavaScript/Guide/%EC%A0%95%EA%B7%9C%EC%8B%9D
            //문제의 원흉은 replaceAll 함수를 인식하지 못한다는것.
            const spaceIndex = name.indexOf(" ");
            //  First name + Last name 일 경우
            if (spaceIndex !== -1) {
                return mosaicCharacter.repeat(spaceIndex) + name.substring(spaceIndex+1);
            } else {
                const midLength = name.length / 2;
                return mosaicCharacter.repeat(midLength) + name.substring(midLength);
            }
            break;
    }

}