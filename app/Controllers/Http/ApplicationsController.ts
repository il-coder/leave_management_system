import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

export default class ApplicationsController {
    //update application status to accepted
    public async acceptApplication({request, response, session, auth, params}: HttpContextContract) {
        await auth.use('web').authenticate()
        const user = auth.use('web').user!;
        if(user.username != params.userName || user.role != 'admin') {
            return response.notFound();
        }
        const applicationSchema = schema.create({
            username: schema.string({ trim: true },[rules.exists({ table: 'applications', column: 'username' , where: {'email': request.qs()['email'], 'date': new Date(request.qs()['date']).toISOString().substr(0,10)}})]),
        })
        await request.validate({ schema: applicationSchema, messages: {'username.exists' : "No such leave application found"} })
        // console.log(payload)
        const rows = await Database
                    .from('applications')
                    .where('username',request.qs()['username'])
                    .andWhere('email',request.qs()['email'])
                    .andWhere('date',new Date(request.qs()['date']).toISOString().substr(0,10))
                    .update({status: 'Accepted' })
        
        // console.log(rows)
        if(rows.length<=0) {
            session.flash('status', 'Unable to save changes. Please try again later.')
        }
        else {
            session.flash('status', 'Application accepted successfully')
        }
        response.redirect().back();
        return
    }

    //update application status to rejected
    public async rejectApplication({request, response, session, params, auth}: HttpContextContract) {
        await auth.use('web').authenticate()
        const user = auth.use('web').user!;
        console.log(user, params.userName);
        if(user.username != params.userName || user.role != 'admin') {
            return response.notFound();
        }
        const applicationSchema = schema.create({
            username: schema.string({ trim: true },[rules.exists({ table: 'applications', column: 'username' , where: {'email': request.qs()['email'], 'date': new Date(request.qs()['date']).toISOString().substr(0,10)}})]),
        })
        await request.validate({ schema: applicationSchema, messages: {'username.exists' : "No such leave application found"} })
        // console.log(payload)
        const rows = await Database
                    .from('applications')
                    .where('username',request.qs()['username'])
                    .andWhere('email',request.qs()['email'])
                    .andWhere('date',new Date(request.qs()['date']).toISOString().substr(0,10))
                    .update({status: 'Rejected' })
        
        // console.log(rows)
        if(rows.length<=0) {
            session.flash('status', 'Unable to save changes. Please try again later.')
        }
        else {
            session.flash('status', 'Application rejected successfully')
        }
        response.redirect().back()
        return
    }

    //validate and load leave application
    public async userApplication({response, view, params, auth}: HttpContextContract) {
        await auth.use('web').authenticate()
        const user = auth.use('web').user!;
        if(user.username != params.userName) {
            response.notFound();
        }
        else if(user.role == 'admin') {
            const applications = await Database
                    .from('applications')
                    .select('*')
                    .where('email', user.email)
                    .andWhere('status','Pending')
            return view.render('admin_leave',{user: user,applications: applications})
        }
        else {
            const applications = await Database
                    .from('applications')
                    .select('*')
                    .where('username',params.userName)
            return view.render('leave_apply',{user: user, applications: applications})
        }
    }

    //add leave application
    public async addApplication({request, response, session}: HttpContextContract) {
        const applicationSchema = schema.create({
            username: schema.string({ trim: true },[rules.exists({ table: 'users', column: 'username'})]),
            email: schema.string({},[rules.email()]),
            date: schema.date({format: 'sql'},[rules.after('today')]),
            reason: schema.string()
        })

        const payload = await request.validate({schema: applicationSchema});
        // console.log(payload)
        try {
            const rows = await Database
                    .table('applications')
                    .insert({ username: payload['username'], email: payload['email'], date: payload['date'].toSQLDate(), reason: payload['reason'], status: 'Pending'})
        
            if(rows.length <=0 ) {
                session.flash('status', 'Unable to save changes. Please try again later.')
            }
            else {
                session.flash('status', 'Leave application saved successfully.')
            }
        }
        catch {
            session.flash('status', 'Leave application already exists');
        }
        finally {
            response.redirect().back()
        }
        return
    }
}
