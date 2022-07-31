const apiController = require('./APIController');

class MainController {

    async showForks(req, res) {
        var url = req.query.repoName;
        var path = url.slice(19);
        var rootPath = await apiController.getRootPath(path);
        const forksList = await apiController.getAllRepoFork(rootPath);
        res.render('forks', {
            source_path: path,
            forksList: forksList
        });
    }

    async showCommit(req, res) {
        var sourcePath = req.query.source;
        var path = req.query.path;
        var user = req.query.user;
        var repos = req.query.repos;
        const aheadCommits = await apiController.getAheadCommit(sourcePath, path, user, repos);
        console.log(aheadCommits);
        res.render('commit', {
            aheadCommits: aheadCommits
        });
    }

    index(req, res) {
        res.render('home');
    }

}

module.exports = new MainController;