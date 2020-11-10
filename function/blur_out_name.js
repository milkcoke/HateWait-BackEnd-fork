// Javascript string is immutable.


module.exports = async (name)=>{
    const mosaicCharacter = 'X';

    switch(name.length) {
        //한글이름 2~4자
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
            const englishRegex = RegExp('a-zA-Z');
            const spaceIndex = name.indexOf(" ");
            //  First name + Last name 일 경우
            if (spaceIndex !== -1) {
                return name.substring(0, spaceIndex).replaceAll(englishRegex, mosaicCharacter) + name.substring(spaceIndex + 1);
            } else {
                const midLength = name.length / 2;
                return name.substring(0, midLength).replaceAll(englishRegex, mosaicCharacter) + name.substring(midLength + 1);
            }
            break;
    }
}