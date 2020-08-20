const path = require('path');
const qualichainRoutes = require('./routes/qualichain-routes');

module.exports = (app) => {
    app.use('/qualichain', qualichainRoutes);

    /***********************************************************************************************
     * MAIN
     */
    const staticRoot = path.resolve(__dirname, '../public');
    app.get('/*', function(req, res) {
        res.sendFile('index.html', { root: staticRoot });   // load the single view file (angular will handle the page changes on the front-end)
    });

};