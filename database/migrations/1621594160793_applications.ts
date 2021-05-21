import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Applications extends BaseSchema {
  protected tableName = 'applications'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.string('username').notNullable()
      table.string('email').notNullable()
      table.date('date').notNullable()
      table.text('reason').notNullable()
      table.string('status').notNullable()
      table.primary(['username','date'])
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
