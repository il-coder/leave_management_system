import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

export default class UsersController {
    //list all users
    public async listUsers({view}: HttpContextContract) {
        const users = await Database
                    .from('users')
                    .select('*')
        return view.render('list_users',{users: users})
    }
    
    //add new user
    public async addUser({request, response, session}: HttpContextContract) {
        const userSchema = schema.create({
            username: schema.string({ trim: true },[rules.unique({table: 'users', column: 'username'})]),
            email: schema.string({},[rules.email(), rules.unique({table: 'users', column: 'email'})]),
            password: schema.string(),
            role: schema.enum(['user','admin'] as const)
        })
        const payload = await request.validate({ schema: userSchema })
        // console.log(payload)
        const rows = await Database
                    .table('users')
                    .insert({ username: payload['username'], email: payload['email'], password: payload['password'], role: payload['role'] })

        if(rows.length<=0) {
            session.flash('status', 'Unable to create user. Please try again later.')
            response.redirect('/addUser')
        }
        else {
            session.flash('status', 'User created successfully')
            response.redirect('/listUsers')
        }
        return 
    }

    //edit user info
    public async editUser({request, response, session}: HttpContextContract) {
        const userSchema = schema.create({
            orgusername: schema.string({},[rules.exists({ table: 'users', column: 'username' })]),
            orgemail: schema.string({},[rules.email(), rules.exists({ table: 'users', column: 'email' })]),
            username: schema.string({ trim: true },[rules.unique({table: 'users', column: 'username', whereNot: {username: request.body()['orgusername']}})]),
            email: schema.string({},[rules.email(),rules.unique({table: 'users', column: 'email', whereNot: {email: request.body()['orgemail']}})]),
            password: schema.string(),
            role: schema.enum(['user','admin'] as const)
        })
        const payload = await request.validate({ schema: userSchema })
        // console.log(payload)
        const rows = await Database
                    .from('users')
                    .where('username',payload['orgusername'])
                    .andWhere('email',payload['orgemail'])
                    .update({ username: payload['username'], email: payload['email'], password: payload['password'], role: payload['role'] })
        
        if(rows.length<=0) {
            session.flash('status', 'Unable to save changes. Please try again later.')
        }
        else {
            session.flash('status', 'Changes saved successfully')
        }
        response.redirect('/listUsers')
        return
    }

    //delete user
    public async deleteUser({request, response, session}: HttpContextContract) {
        const userSchema = schema.create({
            username: schema.string({ trim: true },[rules.exists({ table: 'users', column: 'username' , where: {'email': request.qs()['email'], 'role': request.qs()['role']}})]),
            email: schema.string({},[rules.email()])
        })
        const payload = await request.validate({ schema: userSchema })
        // console.log(payload)
        const rows = await Database
                    .from('users')
                    .where('username',payload['username'])
                    .andWhere('email',payload['email'])
                    .delete()
        
        if(rows.length<=0) {
            session.flash('status', 'Unable to delete user. Please try again later.')
        }
        else {
            session.flash('status', 'User deleted successfully')
        }
        response.redirect('/listUsers')
        return
    }
}
