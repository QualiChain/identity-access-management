const path = require('path');
const qualichainRoutes = require('./routes/qualichain-routes');
const userRoutes = require('./routes/user-routes');
const authRoutes = require('./routes/auth-routes');

module.exports = (app) => {
    app.use('/qualichain', qualichainRoutes);
    app.use('/users', userRoutes);
    app.use('/auth', authRoutes);

    /***********************************************************************************************
     * MAIN
     */
    const staticRoot = path.resolve(__dirname, '../public');
    app.get('/*', function(req, res) {
        res.sendFile('index.html', { root: staticRoot });   // load the single view file (angular will handle the page changes on the front-end)
    });

};