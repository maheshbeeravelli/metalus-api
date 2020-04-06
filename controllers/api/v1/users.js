const UsersModel = require('../../../models/users.model');
// const BaseRoutes = require('../../../lib/base.routes');
const passport = require('passport');

module.exports = function (router) {
  // const baseRoutes = new BaseRoutes('user', 'users', UsersModel);
  // baseRoutes.buildBasicCrudRoutes(router);

  // custom routes go here
  router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect(`${req.protocol}://${req.get('host')}/login`);
      }
      req.logIn(user, (error) => {
        if (error) {
          return next(error);
        }
        return res.json(user);
      });
    })(req, res, next);
  });

  router.put('/:id/changePassword', async (req, res,next) => {
    const changePassword = req.body;
    const userModel = new UsersModel();
    const user = await req.user;
    if (changePassword.id !== user.id && user.role !== 'admin') {
      next(new Error('User does not have permission to change password for different user!'));
    }
    // Verify the provided password matches the password on file
    const updateUser = await userModel.getUser(changePassword.id);
    if (user.role !== 'admin' && changePassword.password !== updateUser.password) {
      next(new Error('Invalid password provided!'));
    }
    // Change password and return new user
    updateUser.password = changePassword.newPassword;
    const newuser = await userModel.update(updateUser.id, updateUser);
    res.status(200).json(newuser);
  });
};
