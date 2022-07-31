const forksRouter = require('./forks');
const siteRouter = require('./site');
const commitRouter = require('./commit');

function route(app) {
    app.use('/forks', forksRouter);
    app.use('/commit', commitRouter);
    app.use('/', siteRouter);
}

module.exports = route;