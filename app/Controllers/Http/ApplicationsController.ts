import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Database from '@ioc:Adonis/Lucid/Database'

export default class ApplicationsController {
    //list all pending applications
    public async listPendingApplications({view}: HttpContextContract) {
        const applications = await Database
                    .from('applications')
                    .select('*')
                    .where('status','Pending')
                    .orWhere('status','pending')
        return view.render('admin_leave',{applications: applications})
    }

    //update application status to accepted
    public async acceptApplication({request, response, session}: HttpContextContract) {
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
        response.redirect('/admin/leave')
        return
    }

    //update application status to rejected
    public async rejectApplication({request, response, session}: HttpContextContract) {
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
        response.redirect('/admin/leave')
        return
    }

    //validate and load leave application
    public async userApplication({response, view, params}: HttpContextContract) {
        const user = await Database
                    .from('users')
                    .select('*')
                    .where('username',params.userName)
        if(user.length <=0 ) {
            response.notFound();
        }
        else {
            const applications = await Database
                    .from('applications')
                    .select('*')
                    .where('username',params.userName)
            return view.render('leave_apply',{user: user[0], applications: applications})
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
