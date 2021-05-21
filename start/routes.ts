import Route from '@ioc:Adonis/Core/Route'

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

Route.get('/admin/leave', 'ApplicationsController.listPendingApplications')

Route.get('/:userName/leave','ApplicationsController.userApplication')

Route.get('/admin/accept', 'ApplicationsController.acceptApplication')

Route.get('/admin/reject', 'ApplicationsController.rejectApplication')

Route.post('/addNewApplication', 'ApplicationsController.addApplication')

Route.get('/', async ({ view }) => {
  return view.render('home')
})