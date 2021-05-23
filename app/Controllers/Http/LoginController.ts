import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';

export default class LoginController {
    public async login({view, auth, response}: HttpContextContract) {
        try {
            await auth.use('web').authenticate()
            const username = auth.use('web').user!['username'];
            response.redirect(`/${username}/leave`)
        }
        catch {
            return view.render('login')
        }
        return
    }

    public async validate({auth, response, session, request}: HttpContextContract) {
        const username = request.input('username')
        const password = request.input('password')

        const user = await Database
                    .from('users')
                    .select('*')
                    .where('username', username)
                    .orWhere('email', username)
                    .firstOrFail()

        if(!(user.password == password)) {
            session.flash('status', 'Invalid Credentials')
            response.redirect('/login')
        }
        await auth.use('web').login(user) 
        response.redirect(`/${auth.use('web').user!['username']}/leave`)
        return
    }

    public async logout({auth, response}: HttpContextContract) {
        await auth.use('web').logout()
        response.redirect('/login')
        return
    }
}
