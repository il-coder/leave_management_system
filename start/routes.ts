import Route from '@ioc:Adonis/Core/Route'

Route.get('/login','LoginController.login')

Route.post('/login','LoginController.validate')

Route.get('/listUsers/delete', 'UsersController.deleteUser')

Route.post('/editUser', 'UsersController.editUser')

Route.post('/addNewUser', 'UsersController.addUser')

Route.get('/addUser', async ({ view }) => {
  return view.render('add_user')
})

Route.get('/listUsers', 'UsersController.listUsers')

Route.get('/listUsers/edit', async ({ view, request }) => {
  return view.render('add_user',{user: request.qs()})
})

Route.get('/:userName/leave','ApplicationsController.userApplication')

Route.get('/:userName/accept', 'ApplicationsController.acceptApplication')

Route.get('/:userName/reject', 'ApplicationsController.rejectApplication')

Route.post('/addNewApplication', 'ApplicationsController.addApplication')

Route.get('/logout','LoginController.logout');

Route.get('/', async ({ view }) => {
  return view.render('home')
})