# Dicemagic.Beyond &nbsp; &nbsp; &nbsp; ![travis-ci build status tag](https://travis-ci.org/FX-Wood/dicemagic.beyond.svg?branch=master)

DiceMagic.Beyond is a chrome extension that allows users of dndbeyond.com to display dice rolling results when they click on a roll in their character sheet.

## Hosted Installation
- [Chrome Web Store](https://chrome.google.com/webstore/detail/dicemagicbeyond/jdiefafcjohmkpnbgednhedeghbbgmbe) &nbsp; ![chrome version tag][chrome-version-tag] 

- [Firefox AMO (Coming Soon!)](https://addons.mozilla.org/en-US/firefox/) &nbsp; ![firefox version tag][firefox-version-tag]

## Local Installation
1. ```sh 
    $ git clone github.com/fx-wood/dicemagic.beyond && cd dicemagic.beyond/ # clone repo
    ```
2. ```sh
    $ npm install # install dependencies
    ```
3. ```sh
    $ npm run build # build extension file from src
    ```
4. open google chrome and navigate to: ```chrome://extensions```

5. click `load unpacked` button

6. select `.../dicemagic.beyond/build/`

Dicemagic.beyond relies on webpack to bundle its javascript modules. You may use `$ npm run watch` and webpack will watch any included js files for changes. Chrome will reflect the changes after refreshing the extension at `chrome://extensions` (just click on the refresh icon)

## Dependencies
This extension relies on the dicemagic api. It provides cryptographically secure rolls. They are EXTREMELY random. You may find documentation for the API [here](https://github.com/aasmall/dicemagic "dicemagic on github")



## Thanks
Special thanks to Aaron for funding the development of this project. Thank you also to the rest of my D & D party, you are the greatest.

## Prior Art
There are a few similar extensions out there, please check them out:

#### D&D Toolbox
[Chrome Store](https://chrome.google.com/webstore/detail/dd-toolbox/fffggleecacldpcipbechibchfikglgh?hl=en-US) | [GitHub](https://github.com/mouse0270/Beyonds-Toolbox/)

[Beyond Help](https://chrome.google.com/webstore/detail/beyond-help/aojmegjchfjmkgmihimpplblfalnpdop?hl=en-US "chrome store") | [Github](https://github.com/emfmesquita/beyondhelp)

[D&D Beyond Interaction](https://chrome.google.com/webstore/detail/dd-beyond-interaction/bjldjglkgldigknoeebkiflgmcckikpf?hl=en "chrome store")


[firefox-version-tag]:https://img.shields.io/static/v1.svg?label=firefox&message=1.1.5&color=blue&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpMwidZAAADX0lEQVQ4EV1TXWhcVRD+5tx7d3PvZrM/qbpJGpKapGKbEsnWTSgVg2Bfomhbti8uFbGIGrG+SqHePhTxyT5UsIIRRCikLdSHNKUitpLSVqmhNKDRbWMaN2mzWbPJbvbv/oznboiCA8M5DN98M+ebOYA0Bsg7TdMUnnv3/5uz1H+MeQMnz/8wm8m8M+n7N+nV+QTedE50mbWzOMGj4zfGv2JOsJPb96nExzzcJpkqS8sYkFn/+4vvut84++ITh1NDRimV6kzjvLEd9wygtbkEFHKuMDo/wJ2B1/n7WwkipHkMSr2Vsa3JNsBODTyevry47ULq4va3EaX79uU12CjbtlN+6MhXkltyLeyKRXBo7ymvKJIm1wmeFyvDbf51JRj4zY1FT9sh/QcO5Mrqx/qsCkuo1+fiCmppyWCpyFZshALDvLhnmMh0xWd4txGOOA7FAqs6u2qryqKD9mkHcED9BhHbxdG7Cdya/hxkf0tsy5o1C6jQUa8JEW+q9RK0NmbbJSHVdQVIn8NF+0s8NTWCcL7qgTE4cQTpqQ9BxQkFefmianWQf+pqVx3L36m4fsAldixNrD7I40L6GN6y2iX9I8xaYfQ8VsYf5SAm03vQHQBxIGuTQUHM2S+r1ZpeKDk+NLEgrPo4oq1Rf3QRfbMZDGxdQWRLE8azLXJMQVTiK4Ai+17OAhFNFiBHLTiNM3mrwYpaumZYVYYvhnhsFDd7f0RDSxr5hm2gK8cxPdmKZ0YmAUeuQNFRyF0FNPWX+gbeMN67vSN6v78x8MARHXklF4rhWqEHcxTAmbsdmPkrhNMjGbyz/xOIvEdBcip8jV7DkOopWagGT61VWr/WtCVXfxQUzcY87Q7rEKUOnHwuja4ns+jbcQm0JLeuRhZBVzATvgQsSEG8DZHxSf/75/ualw76jV8tLVwWaM8ItKwTorJCSLqiuXLUjtRA44UtC/Sw+VkanVlQCKa4iqs86tw8d5Cv7AwrDbt8TlWgKHdiPeSiGHCxarhUEgqKEYUz+gTZy6/QmVyGk3VJgTEkPW3rNhU6fGS+9aXfK517mZ+OM+/uZR7q4dIL3dafg4MnN3Gc3Mipi+gFTdnJRzB543OZYrbtdiLqW+nRUdI11VmG6/xM96bn67/wkBzgOSmmtH8AEU9r1+6Kcw8AAAAASUVORK5CYII=

[chrome-version-tag]: https://img.shields.io/static/v1.svg?label=chrome&message=1.2.0&color=blue&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAACXBIWXMAAAsTAAALEwEAmpwYAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgpMwidZAAADSUlEQVQ4ETVTz29UVRT+zr33vdeZwjCDrUzCD9EB2iBtQJgS2oWLyg/DQlhQjUyIGGoQoy78B3TFggULYmvQpCHqBhKIcUGogVIXBcGEBKetQmtUEkhjx5SZzrz35r17r+dRejbvvHvP993z4zsEtotHjsiBS5d04v/z3ttF3fRP2DjuBewmWD7UegaCbinP/XrD9z/eTeKWMbTsJIezpUNDbhx/mGJUM9YI4og5AJcIniT42iAScrhwefTUMgklTmKTA2+O5h2192kYGUZpUq6w2gjLBARrrPYNtJGrXUf8Z8xPhcs39iW4ZwQ/v7t3eGNgTy4ahJ5SLoFIPyzz5WOO0NY0chDrXuNwa00zjnJKeZU5O9Q5PfYR4epnxY//nL9TuvLApFtT5FiQCmpYUToO80o3SEJT5T786bMQ6gU4rmOVo63nCUflvB61vVIdPPfSKrza3aZ7fq04cBaR/eIcJrO9uPl78ijk6x27sbNzK7y/TsL11kBIiiijYKrxCRFYu8cLmrjSlRdP/p7glz/AFIP7vw1xYyrA9ekAb1wIcbfah5b1n3BZ9wHZKqAFyJW9okEoFPwI11Y44t7hrVAbu3DzD2BPq8XajMDalQJ9WYPRskU91Q3REjJQCHCrSaDAXdbwOc98pHF6yzpU0xJuDARJexMN8BgSgSxNg53Ekh++tPxNxjQbORLtxpi68vBL8yH6O4B7TwmTNY1yzeA2+we2AanoNwZlEgrD4uByaEYx1wQpsW2h2TQbvDb5/sxVjO3uwERpF8anLBRnsmMLYXPmNmhhhEfUxfjQwBHSNOwtyo8cLZLj3mHRGFYcVYymuglwvuMgNuc6+S2L8qMy3mq5gPU5xZJSlpJDCREFpvhMSPmRY1/SqpZTuhqEHpEbW0tP/DnA4ernfZx/sY7Bne2sT76AbiLreHo+HFI94yyk57ZmpHRNZFL74lpgJK9Pu1CiHGvR3wjxQ7Fh0l6d5QxJOSV0JRpVxbH9CVTwWnE8MHf8u/16oTHEoxE6xVpTWtpaQJ+/XKd0tiGRVg4pTvvfcHgZfJGxSxkkJANL69z21Tu7Vrti8EFoej+V/qYz2xetIj0bW5qIIvNNa9/40jozZoAx/wNryH3+KU1V1AAAAABJRU5ErkJggg==