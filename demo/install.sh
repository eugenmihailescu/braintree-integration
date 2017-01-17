#!/bin/bash
URL=https://github.com/braintree/braintree_php_example
URL1=https://github.com/eugenmihailescu/myinputmask.git
SRC=$(dirname "$0")
DST=/tmp/braintree_php_example

function fecho {
	echo -e "\e[1m\e[$1m$2\e[0m"
}
function echoy {
	fecho 93 "$1"
}
function edone {
	fecho 97 "Done\n"
}

echoy "Removing existing destination directory..."
rm -rf ${DST}
edone

echoy "Getting required components from Github..."
git clone ${URL} ${DST}
git clone ${URL1} ${DST}/vendor/myinputmask
edone

echoy "Preparing the demo public directory..."
# rename some source directories
mkdir -p ${DST}/public_html/assets/{img,fonts,css,js,templates}
mkdir -p ${DST}/public_html/assets/js/integration
mkdir -p ${DST}/public_html/assets/js/app/

mv -t ${DST}/public_html/assets/img ${DST}/public_html/images/*
mv -t ${DST}/public_html/assets/fonts ${DST}/public_html/fonts/*
mv -t ${DST}/public_html/assets/css ${DST}/public_html/css/*
mv -t ${DST}/public_html/assets/js ${DST}/public_html/javascript/*

# copy our source includes
cp ${SRC}/includes/*.php ${DST}/includes

# copy our source assets
cp ${SRC}/public_html/assets/css/3dsframe.css ${DST}/public_html/assets/css/
cp ${SRC}/public_html/assets/img/ring-alt.gif ${DST}/public_html/assets/img/
cp ${SRC}/public_html/assets/js/app/* ${DST}/public_html/assets/js/app/
cp ${SRC}/../src/*.js ${DST}/public_html/assets/js/integration
cp ${DST}/vendor/myinputmask/src/*.js ${DST}/public_html/assets/js/integration
cp -r ${SRC}/public_html/assets/templates ${DST}/public_html/assets

cp ${SRC}/public_html/{index,checkout}.php ${DST}/public_html/
cp ${DST}/example.env ${DST}/.env

edone

echoy "Installing vendor dependencies via Composer..."
composer install -d ${DST}
edone

fecho 97 "++++++++++++++++++++++++++++++++++++++++++++++++++"
fecho 97 "+ MAKE SURE YOU CONFIGURE YOUR BRAINTREE KEYS AT +"
echoy " ${DST}/.env"
fecho 97 "++++++++++++++++++++++++++++++++++++++++++++++++++"

echoy "Starting the local PHP webserver..."
php -S localhost:3000 -t "${DST}/public_html"