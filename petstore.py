# -*- coding: utf-8 -*-
from openerp import api, fields, models

class employee_sign(models.Model):
    _name = 'opetstore.employee_sign'

    date = fields.Date(string='创建日期', default=lambda self: fields.datetime.now())
    user_id = fields.Many2one('res.users', default=lambda self: self.env.user, string="创建用户")
    employee_id = fields.Many2one('hr.employee', string="员工")
    exam_user = fields.Many2one('res.users', string="审批人")
    status = fields.Selection([(u'待审批', u'待审批'), (u'已审批', u'已审批'), (u'已退回', u'已退回'), (u'追回', u'追回')],
                              default=u"待审批")
    start_time = fields.Char(string="开始时间")
    end_time = fields.Char(string="结束时间")
    project = fields.Many2one("nantian_erp.working_team", string="项目")
    partner_id = fields.Many2one("res.partner", string="客户", domain="[('category','=',u'服务客户')]")
    unit = fields.Integer(string="时长")
    address = fields.Many2one("opetstore.work_address")
    work_content = fields.Char(string="工作内容")
    default_sign_id = fields.Many2one("opetstore.default_sign", "sign_id")
    default = fields.Boolean(string="是否置为默认")

    @api.model
    def get_sign_by_date(self,**kwargs):
        # 根据日期获取签到
        print kwargs
        employee_signs = self.env["opetstore.employee_sign"].search([('date', '=', kwargs.get("date")),('user_id', '=', self.env.uid)])
        signs = []
        for employee_sign in employee_signs:
            signs.append({"date": employee_sign.date, "user_id": employee_sign.user_id.id,
                          "status": employee_sign.status,"start_time" : employee_sign.start_time,
                          "end_time": employee_sign.end_time, "project": employee_sign.project.id,
                          "partner_id": employee_sign.partner_id.id, "address": employee_sign.address.id,
                          "work_content": employee_sign.work_content, "default": employee_sign.default})
        return signs

    @api.model
    def get_all_partner(self):
        # 获取所有的客户
        partner_objs = self.env["res.partner"].search([('category','=',u'服务客户')])
        partners=[]
        for partner in partner_objs:
            partners.append({"name": partner.name, "id": partner.id})
        return partners

    @api.model
    def get_all_project(self ):
        # 获取所有的项目
        project_objs = self.env["nantian_erp.working_team"].search([])
        projects = []
        for project in project_objs:
            projects.append({"id":project.id, "name": project.name, "partner_id": project.partner_id.id})
        return projects

    @api.model
    def get_sign_by_month(self, **kwargs):
        # 获取当前月的签到情况
        employee_signs = self.env["opetstore.employee_sign"].search(
                [('user_id', '=', self.env.uid)])
        signs = []
        for employee_sign in employee_signs:
            dates = employee_sign.date.split("-")
            if str(dates[0]) == str(kwargs.get("year")) and str(int(dates[1])) == str(kwargs.get("month")):
                if dates[2] not in signs:
                    signs.append(dates[2])
        print signs
        return signs

    @api.model
    def commit(self, **kwargs):
        # 提交按钮
        old_defaults = self.env["opetstore.default_sign"].search([("user_id","=", self.env.uid)])
        flag = True
        for data in kwargs.get("signList"):
            sig_record = self.env["opetstore.employee_sign"].create(data)
            if data.get("default"):
                if flag:
                    if old_defaults:
                        old_defaults.unlink()
                    flag = False
                default_sign_id = self.env["opetstore.default_sign"].create({"user_id": sig_record.user_id.id,
                                                                             "sign_id": [sig_record]})
                sig_record.default_sign_id = default_sign_id
        return "ok"

    @api.model
    def get_user(self):
        # 获取所有的用户
        user = self.env.user
        return {"id" : user.id, "name": user.name}

    @api.model
    def get_default_sign(self):
        # 获取默认签到
        signs_list = []
        default_signs = self.env["opetstore.employee_sign"].search([('default_sign_id', '!=', None),
                                                                    ('user_id', '=', self.env.uid)])
        print default_signs
        for employee_sign in default_signs:
            signs_list.append({"date": employee_sign.date, "user_id": employee_sign.user_id.id,
                          "status": employee_sign.status, "start_time": employee_sign.start_time,
                          "end_time": employee_sign.end_time, "project": employee_sign.project.id,
                          "partner_id": employee_sign.partner_id.id, "address": employee_sign.address.id,
                          "work_content": employee_sign.work_content, "default": employee_sign.default})
        return signs_list


class work_address(models.Model):
    _name = "opetstore.work_address"
    _rec_name = "name"

    name = fields.Char(string="地址名")

    @api.model
    def get_all_work_address(self):
        all_address =self.env["opetstore.work_address"].search([])
        address = []
        for addr in all_address:
            address.append({"id": addr.id, "name": addr.name})
        return address


class default_sign(models.Model):
    _name = "opetstore.default_sign"

    user_id = fields.Many2one("res.users")
    sign_id = fields.One2many("opetstore.employee_sign", "default_sign_id")
