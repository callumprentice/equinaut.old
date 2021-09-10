#!/bin/bash

# must run from the ./publish folder
if [ ! -f ./publish.sh ]; then
    echo "Run from the publish folder"
    exit
fi

rm -rf ./site

mkdir -p site/css
cp -R ../css/* ./site/css/

mkdir -p site/img
cp -R ../img/* ./site/img/

mkdir -p site/js
cp -R ../js/* ./site/js/

mkdir -p site/panos
cp -R ../panos/* ./site/panos/

cp ~/work/callum/web/web-sandbox/panos/*.jpg ./site/panos
menu_name=menu.html

python3 gen_menu.py --mode publish

cp ../index.html ./site/
cp ../favicon.ico ./site/
cp .surgeignore ./site

echo "// Visit https://github.com/callumprentice/equinaut/blob/master/README.md for source, information, license etc." > ./site/js/equinaut.min.js
curl -X POST -s --data-urlencode 'input@site/js/equinaut.js' https://javascript-minifier.com/raw >> ./site/js/equinaut.min.js

cp ./site/index.html ./site/index.orig

sed -i -e "s/equinaut.js/equinaut.min.js/g" ./site/index.html

exit

surge teardown https://equinaut.surge.sh

surge --domain https://equinaut.surge.sh --project ./site

cp ./site/index.orig ./site/index.html

rm ./site/index.orig
rm ./site/index.html-e
rm ./site/js/equinaut.min.js
