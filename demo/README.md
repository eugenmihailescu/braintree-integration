##1. INSTALLATION
Clone this git repository: `git clone https://github.com/eugenmihailescu/braintree-integration.git`

Then:
- on Unix like systems just run the `./install.sh`, it should do the rest.
- on a Windows system just follow the Linux-like commands shown on install.sh at your Windows command prompt.

##2. CONFIGURATION
Open the `braintree_php_example/.env` file and set the Braintree environment credentials.

##3. RUN
On Unix like system it starts automatically a built-in PHP web server on `http://localhost:3000`
You may however setup a Apache|Nginx|whatever web server by using the `braintree_php_example` directory as your web server's document root.

To start at a later time the built-in PHP web server just type the following command at your shell:
`php -S -t braintree_php_example localhost:3000`
  
##4. 3D-Secure
**3D-Secure requires HTTPS** which does not work on the built-in PHP web server. You might want to configure a Apache|Nginx|whatever web server instead. 

##5. FEEDBACK
Issues should be reported at https://github.com/eugenmihailescu/myinputmask/issues 