#copies files and uses webpack to build js
rm -rf build/*
cp -R icon build/icon 
cp -R fonts build/fonts 
cp -R html build/html 
cp -R css build/css 
cp manifest.json build/manifest.json 