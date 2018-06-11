# -*- coding: utf-8 -*-
from openerp import api, fields, models


class message_of_the_day(models.Model):
    _name = "oepetstore.message_of_the_day"

    @api.model
    def my_method(self,**kwargs):
        print(kwargs)
        return {"signDates": [8,9,10]}

    @api.model
    def testForm(self,**kwargs):
        print(kwargs)
        return {"formData": [{},{}]}


class employee_sign(models.Model):
    _name = 'opetstore.employee_sign'

    date = fields.Date(string='创建日期', default=lambda self: fields.datetime.now())
    user_id = fields.Many2one('res.users', default=lambda self: self.env.user, string="创建用户")
    employee_id = fields.Many2one('hr.employee', default=lambda self: self._get_employee_id(), string="员工")
    exam_user = fields.Many2one('res.users', string="审批人")
    status = fields.Selection([(u'待审批', u'待审批'), (u'已审批', u'已审批'), (u'已退回', u'已退回'), (u'追回', u'追回')],
                              default=u"待审批")
    start_time = fields.Datetime(string="开始时间")
    end_time = fields.Datetime(string="结束时间")
    project = fields.Many2one("nantian_erp.working_team", string="项目")
    partner_id = fields.Many2one("res.partner", string="客户", domain="[('category','=',u'服务客户')]")
    unit = fields.Integer(string="时长")
    address = fields.Char(string="工作地点")
    work_content = fields.Char(string="工作内容")

    @api.model
    def get_sign_by_date(self, date):
        employee_signs = self.env["opetstore.employee_sign"].search([('date', '=', date)])
        print(employee_signs)

    def get_all_partner(self):
        partner_objs = self.env["res.partner"].search([('category','=',u'服务客户')])
        partners=[]
        for partner in partner_objs:
            partners.append({"name": partner.name, "id": partner.id})

    def get_all_project(self):
        projects = self.env["nantian_erp.working_team"].search()

