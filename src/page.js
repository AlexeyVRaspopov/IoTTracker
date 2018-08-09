var serverAddress = window.location.origin;
        var locationsJSON;
        var bearerToken;
        var map;
        var authContext = new AuthenticationContext({
            tenant: 'b422fa63-ca80-43c6-9fa9-1cc5d9e7a7c5',
            clientId: '69c3cab5-8242-4e15-9500-01dc69122211',
           redirectUri: window.location.origin
        });
        
            console.log('check if user exist');
            authContext.handleWindowCallback();
            var user = authContext.getCachedUser();
            if (!user) {
                console.log('user not exist, login');
                authContext.login();
            }
            else {
                console.log('user exist');
            }

            if (authContext.isCallback(window.location.hash)) {
                authContext.handleWindowCallback();
                var err = authContext.getLoginError();
                if (err) {
                    document.getElementById('api_response').textContent =
                        'ERROR:\n\n' + err;
                }

            } else {
                var user = authContext.getCachedUser();
                if (user) {
                    authContext.acquireToken('69c3cab5-8242-4e15-9500-01dc69122211', function (err, tokenRes) {
                        if (err) {
                            console.log('unable get token');
                            console.log('error ' + err);
                        }
                        else {
                            console.log('token ok');
                            bearerToken = tokenRes;
                            console.log(bearerToken);
                            map = new google.maps.Map(document.getElementById('map'), {
                                center: {lat: 5.911810500000000e+001, lng: 3.784083800000000e+001},
                                zoom: 18,
                                mapTypeId: 'satellite'
                            });
                        }
                    });
                }                
            }