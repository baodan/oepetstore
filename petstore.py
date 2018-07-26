# -*- coding: utf-8 -*-
from openerp import api, fields, models

class working_team2(models.Model):
    _name = 'oepetstore.working_team2'
    # _inherit = ['mail.thread', 'ir.needaction_mixin']
    # _mail_post_access = 'read'
    name = fields.Char(string=u"名称")
    user_id = fields.Many2one('res.users',  string=u'负责人')
    partner_id = fields.Many2one('res.partner', string=u'客户')
    employee_ids = fields.Many2many('hr.employee', 'working_team_oep', string=u"工作组成员")
    need_employee_count = fields.Integer(string=u"所需人数")
    employee_count = fields.Integer(compute='_count_employees', string=u'现有人数', store=True)
    @api.depends('employee_ids')
    def _count_employees(self):
        for record in self:
            record.employee_count = len(record.employee_ids)

class employee_sign(models.Model):
    _name = 'opetstore.employee_sign'
    _inherit = ['ir.needaction_mixin']

    date = fields.Date(string='创建日期')
    user_id = fields.Many2one('res.users', default=lambda self: self.env.user, string="创建用户")
    employee_id = fields.Many2one('hr.employee', string="员工", compute="_get_employee_id", store=True)
    exam_user = fields.Many2one('res.users', string="审批人")
    state = fields.Selection([('to_examine', u'待审批'), ('examined', u'已审批'), ('backed', u'已退回')],
                              default="to_examine")
    start_time = fields.Selection([('00:00', '00:00'), ('00:30', '00:30'), ('01:00', '01:00'), ('01:30', '01:30'),
                                   ('02:00', '02:00'), ('02:30', '02:30'), ('03:00', '03:00'), ('03:30', '03:30'),
                                   ('04:00', '04:00'), ('04:30', '04:30'), ('05:00', '05:00'), ('05:30', '05:30'),
                                   ('06:00', '06:00'), ('06:30', '06:30'), ('07:00', '07:00'), ('07:30', '07:30'),
                                   ('08:00', '08:00'), ('08:30', '08:30'), ('09:00', '09:00'), ('09:30', '09:30'),
                                   ('10:00', '10:00'), ('10:30', '10:30'), ('11:00', '11:00'), ('11:30', '11:30'),
                                   ('12:00', '12:00'), ('12:30', '12:30'), ('13:00', '13:00'), ('13:30', '13:30'),
                                   ('14:00', '14:00'), ('14:30', '14:30'), ('15:00', '15:00'), ('15:30', '15:30'),
                                   ('16:00', '16:00'), ('16:30', '16:30'), ('17:00', '17:00'), ('17:30', '17:30'),
                                   ('18:00', '18:00'), ('18:30', '18:30'), ('19:00', '19:00'), ('19:30', '19:30'),
                                   ('20:00', '20:00'), ('20:30', '20:30'), ('21:00', '21:00'), ('21:30', '21:30'),
                                   ('22:00', '22:00'), ('22:30', '22:30'), ('23:00', '23:00'), ('23:30', '23:30')]
                                  ,string="开始时间")
    end_time = fields.Selection([('00:00', '00:00'), ('00:30', '00:30'), ('01:00', '01:00'), ('01:30', '01:30'),
                            ('02:00', '02:00'), ('02:30', '02:30'), ('03:00', '03:00'), ('03:30', '03:30'),
                            ('04:00', '04:00'), ('04:30', '04:30'), ('05:00', '05:00'), ('05:30', '05:30'),
                            ('06:00', '06:00'), ('06:30', '06:30'), ('07:00', '07:00'), ('07:30', '07:30'),
                            ('08:00', '08:00'), ('08:30', '08:30'), ('09:00', '09:00'), ('09:30', '09:30'),
                            ('10:00', '10:00'), ('10:30', '10:30'), ('11:00', '11:00'), ('11:30', '11:30'),
                            ('12:00', '12:00'), ('12:30', '12:30'), ('13:00', '13:00'), ('13:30', '13:30'),
                            ('14:00', '14:00'), ('14:30', '14:30'), ('15:00', '15:00'), ('15:30', '15:30'),
                            ('16:00', '16:00'), ('16:30', '16:30'), ('17:00', '17:00'), ('17:30', '17:30'),
                            ('18:00', '18:00'), ('18:30', '18:30'), ('19:00', '19:00'), ('19:30', '19:30'),
                            ('20:00', '20:00'), ('20:30', '20:30'), ('21:00', '21:00'), ('21:30', '21:30'),
                            ('22:00', '22:00'), ('22:30', '22:30'), ('23:00', '23:00'), ('23:30', '23:30')],
    string="结束时间")
    project = fields.Many2one("oepetstore.working_team2", string="项目")
    partner_id = fields.Many2one("res.partner", string="客户", domain="[('category','=',u'服务客户')]")
    unit = fields.Float(string="时长", compute="compute_unit",store=True)
    address = fields.Many2one("opetstore.work_address", string="类型")
    work_content = fields.Text(string="工作内容")
    # default_sign_id = fields.Many2one("opetstore.default_sign", "sign_id")
    default = fields.Boolean(string="是否置为默认", default=True)
    department_first = fields.Char(related='employee_id.department_first', string="一级部门", store=True)
    department_second = fields.Char(related='employee_id.department_second', store=True, string="二级部门")
    examine_record_ids = fields.One2many('opetstore.sign_examine', 'sign_id', string="审批记录")

    @api.multi
    def agree(self):
        self.env["opetstore.sign_examine"].create({'user_id': self.env.user.id,'result':u'同意','sign_id':self.id})
        self.state = "examined"
        self.exam_user = None

    @api.multi
    def disagree(self):
        self.env["opetstore.sign_examine"].create({'user_id': self.env.user.id, 'result': u'不同意', 'sign_id': self.id})
        self.state = "backed"
        self.exam_user = None


    @api.one
    @api.depends("user_id")
    def _get_employee_id(self):
        if self.user_id.employee_ids:
           self.employee_id = self.user_id.employee_ids[0]
        else:
            self.employee_id = None


    @api.multi
    @api.depends("start_time", "end_time")
    def compute_unit(self):
        employee_signs = self.env['opetstore.employee_sign'].search([])
        for record in employee_signs:
            startList = record.start_time.split(":")
            endList = record.end_time.split(":")
            h = int(endList[0]) - int(startList[0])
            m1 = (int(endList[1])+ 60 - int(startList[1])) / 60
            m2 = (int(endList[1])+ 60 - int(startList[1])) % 60
            if m1 >=1:
                record.unit = h+float(m2)/60
            else:
                record.unit = h-1+float(m2)/60


    @api.model
    def get_sign_by_date(self,**kwargs):
        # 根据日期获取签到
        employee_signs = self.env["opetstore.employee_sign"].search([('date', '=', kwargs.get("date")),('user_id', '=', self.env.uid)])
        signs = {"data":[], "unit": False}
        unit = 0
        for employee_sign in employee_signs:
            signs["data"].append({"date": employee_sign.date, "user_id": employee_sign.user_id.id,
                          "state": employee_sign.state,"start_time" : employee_sign.start_time,
                          "end_time": employee_sign.end_time, "project": employee_sign.project.id,
                          "partner_id": employee_sign.partner_id.id, "address": employee_sign.address.id,
                          "work_content": employee_sign.work_content, "default": employee_sign.default})
            unit += employee_sign.unit
        if unit >= 8:
            signs["unit"] = True
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
            if project.user_id:
                name = project.name + "-" + project.user_id.name
            else:
                name = project.name
            projects.append({"id":project.id, "name": name , "partner_id": project.partner_id.id})
        return projects

    @api.model
    def get_sign_by_month(self, **kwargs):
        # 获取当前月的签到情况
        employee_signs = self.env["opetstore.employee_sign"].search(
                [('user_id', '=', self.env.uid)])
        signs = {}
        for employee_sign in employee_signs:
            if employee_sign.date:
                dates = employee_sign.date.split("-")
                if str(dates[0]) == str(kwargs.get("year")) and str(int(dates[1])) == str(kwargs.get("month")):
                    if dates[2] not in signs:
                        signs[str(dates[2])] = employee_sign.unit
                    else:
                        signs[str(dates[2])] += employee_sign.unit
        for key,value in signs.items():
            if value <8:
                signs[key] = "false"
            else:
                signs[key] = "true"
        return signs

    @api.model
    def commit(self, **kwargs):
        # 提交按钮
        date = kwargs.get("signList")[0]["date"]
        old_sign = self.env["opetstore.employee_sign"].search([("user_id","=", self.env.uid),("date","=",date)])
        if old_sign:
            old_sign.unlink()
        for data in kwargs.get("signList"):
            data["default"] = False
            project = self.env["nantian_erp.working_team"].search([("id","=", data["project"])])
            if project:
                data["exam_user"] = project.user_id.id
            sig_record = self.env["opetstore.employee_sign"].create(data)
        unit = 0
        new_signs = self.env["opetstore.employee_sign"].search([("user_id", "=", self.env.uid), ("date", "=", date)])
        for sign in new_signs:
            unit += sign.unit
        if unit > 8:
            return "ok"
        else:
            return "false"

    @api.model
    def get_user(self):
        # 获取所有的用户
        user = self.env.user
        return {"id" : user.id, "name": user.name}

    @api.model
    def get_default_sign(self):
        # 获取默认签到
        signs_list = []
        employee_sign = self.env["opetstore.employee_sign"].search([('default', '=', True),
                                                                  ('user_id', '=', self.env.uid)], limit=1)
        signs_list.append({"date": employee_sign.date, "user_id": employee_sign.user_id.id,
                      "state": employee_sign.state, "start_time": employee_sign.start_time,
                      "end_time": employee_sign.end_time, "project": employee_sign.project.id,
                      "partner_id": employee_sign.partner_id.id, "address": employee_sign.address.id,
                      "work_content": employee_sign.work_content, "default": employee_sign.default})
        return signs_list

    @api.model
    def _needaction_domain_get(self):
        return [('state', '=', 'backed')]


class work_address(models.Model):
    _name = "opetstore.work_address"
    _rec_name = "name"

    name = fields.Char(string="类型")

    @api.model
    def get_all_work_address(self):
        all_address =self.env["opetstore.work_address"].search([])
        address = []
        for addr in all_address:
            address.append({"id": addr.id, "name": addr.name})
        return address


class examine_record(models.Model):
    _name = "opetstore.sign_examine"

    sign_id = fields.Many2one("opetstore.employee_sign", string="报工")
    result = fields.Char(string="审批结果")
    user_id = fields.Many2one("res.users", string="审批人")