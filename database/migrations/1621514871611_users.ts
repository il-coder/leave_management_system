import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.string('username').primary()
      table.string('email').unique().notNullable()
      table.string('password').notNullable()
      table.string('role').notNullable()
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
