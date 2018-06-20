openerp.oepetstore = function(instance, local) {
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;
    local.HomePage = instance.Widget.extend({
        template: "HomePage",
        selectData:{
            timesList:['00:00','00:30','01:00','01:30','02:00','02:30','03:00','03:30','04:00','04:30','05:00','05:30','06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30'],
            clientList:[],
            projectList:[],
            addressList:[]
        },
        userData:null,
        init: function(parent) {
            this._super(parent);
            var _this = this;
            this.model = new instance.web.Model("opetstore.employee_sign");
            this.modelAddress = new instance.web.Model("opetstore.work_address");
            this.modelAddress.call("get_all_work_address",{}).then(function(result) {
                _this.selectData.addressList = result;
            });
            this.model.call("get_all_partner",{}).then(function(result) {
                _this.selectData.clientList = result;
            });
            this.model.call("get_all_project",{}).then(function(result) {
                _this.selectData.projectList = result;
            });
        },
        start: function () {
            var self = this;
            self.model = new instance.web.Model("opetstore.employee_sign");
            self.modelAddress = new instance.web.Model("opetstore.work_address");
            /*获取用户信息和下拉框数据*/
            self.model.call("get_user").then(function(result) {
                self.userData = result;
                self.$('.name span').text(result.name)
                self.modelAddress.call("get_all_work_address",{}).then(function(result) {
                    self.selectData.addressList = result;
                    self.model.call("get_all_partner",{}).then(function(result) {
                        self.selectData.clientList = result;
                        self.model.call("get_all_project",{}).then(function(result) {
                            self.selectData.projectList = result;
                            /*获取当天签到数据和当月签到数据方法*/
                            function getActiveMonth(monthYear,date){
                                self.model.call("get_sign_by_month",monthYear).then(function(result) {
                                    let arr = result;
                //                    console.log('当月签到情况:',result);
                                    Calendar.init(arr);
                                    /*请求当天的签到数据*/
                                    self.model.call("get_sign_by_date",date).then(function(result) {
                //                        console.log('当天签到情况:',result);
                                        if(result[0]){
                                            self.$('.signData').html('');
                                            for(let i = 0;i<result.length;i++){
                                                self.createHtml(self.selectData,result[i]);
                                            }
                                            self.$('.addIcon').hide();
                                            self.$('.delete').hide();
                                            self.$('.inputVal').attr('disabled','true');
                                            $('.bottom span#signBtn').attr('class','signed').text('已签到');
                                        }else{
                                            /*获取默认数据*/
                                            self.$('.signData').html('');
                                            self.model.call("get_default_sign",{}).then(function(result) {
                //                                console.log('默认数据',result)
                                                if(result[0]){
                                                    for(let i = 0;i<result.length;i++){
                                                        self.createHtml(self.selectData,result[i]);
                                                    }
                                                }else{
                                                    self.add_btn();
                                                }
                                                self.$('.addIcon').show();
                                                $('.bottom span#signBtn').attr('class','sign').text('签到');
                                            })
                                        }
                                    });
                                });
                            }
                            /*绘制日历方法*/
                            var Calendar = function(id, options) {
                                    this.main = document.getElementById(id);
                                    this.options = options;
                                    this.today = new Date(options.curDate);
                                    this.year = this.today.getFullYear();
                                    this.month = this.today.getMonth() + 1;
                                    this.day = this.today.getDay();
                                    this.date = this.today.getDate();
                                };
                                Calendar.prototype.init = function(dayArr) {
                                    var me = this;
                                    me.main.innerHTML = me.getCalendar(dayArr);
                                    me.main.querySelector('#nextMonth').addEventListener('click', function(e) {
                                        let viewMonth = me.month,viewYear = me.year;
                                        if(viewMonth == 12) {
                                            viewYear ++;
                                            viewMonth = 1;
                                        }else {
                                            viewMonth ++;
                                        };
                                        let nowM = new Date();
                                        let nextM = new Date(`${viewYear}-${viewMonth}`);
                                        let nowT = nowM.getTime();
                                        let nextT = nextM.getTime();
                                        if(nextT <= nowT){
                                            me.nextMonth();
                                        }else{
                                            var $dialog=new instance.web.Dialog(null,{
                                                size: 'small',
                                                dialogClass: 'oe_act_window',
                                                title: _t("提示")
                                            },'<h3 style="text-align:center;">无法查看未来月!</h3>').open();
                                        }
                                    });
                                    me.main.querySelector('#prevMonth').addEventListener('click', function(e) {
                                        me.prevMonth()
                                    });
                                };
                                Calendar.prototype.getCalendarTime = function() {
                                    return this.year + '-' + this.month + '-' + this.date;
                                };
                                //判断是否是闰年
                                Calendar.prototype.isLeap = function() {
                                    var year = this.year;
                                    if(year % 4 == 0 && year % 100 > 0) {
                                        return true;
                                    }else if(year % 400 == 0 && year % 3200 > 0) {
                                        return true;
                                    }else {
                                        return false;
                                    }
                                };
                                //判断一个月多少天
                                Calendar.prototype.getLen = function() {
                                    var month = this.month;
                                    if(month == 2) {
                                        if(this.isLeap) {
                                            return 29;
                                        }else {
                                            return 28;
                                        }
                                    }else {
                                        if(month < 8) {
                                            if(month % 2 > 0) {
                                                return 31;
                                            }else {
                                                return 30;
                                            }
                                        }else {
                                            if(month % 2 > 0) {
                                                return 30;
                                            }else {
                                                return 31;
                                            }
                                        }
                                    }
                                };
                                Calendar.prototype.getCalendar = function(dayArr) {
                                    var len = this.getLen();
                                    var d = new Date(this.year, this.month - 1, 1);
                                    var dfw = d.getDay();
                                    var arr = new Array();
                                    var tem = 0;
                                    var str = "";
                                    for (var i = 0; i < 6; i++) {
                                        arr[i] = new Array();
                                        for (var j = 0; j < 7; j++) {
                                            tem++;
                                            if (tem - dfw > 0 && tem - dfw <= len) {
                                                arr[i][j] = tem - dfw;
                                            } else {
                                                arr[i][j] = "";
                                            }
                                        }
                                    }
                                    str += '<span class="month-less monthBtn" id="prevMonth"></span><h4>'+this.year + '-' + this.month + '-'+ this.date + '</h4><span class="month-add monthBtn" id="nextMonth"></span>';
                                    str += '<table class="sign_tab" border="0px" cellpadding="0px" cellspacing="0px">';
                                    str += '<thread><tr><th>日</th><th>一</th><th>二</th><th>三</th><th>四</th><th>五</th><th>六</th></tr></thread>';
                                    str += '<tbody>';
                                    for (var k = 0; k < 6; k++) {
                                        if (k == 5 && arr[k][0] == "")
                                            continue;
                                        str += '<tr>';
                                        for (var m = 0; m < arr[k].length; m++) {
                                            dayArr.contains = function(element) {
                                                for (var i = 0; i < this.length; i++) {
                                                    if (element && this[i] == element) {
                                                        return true;
                                                    }
                                                }
                                                return false;
                                            }
                                            if(dayArr.contains(arr[k][m])){
                                                str += '<td class="red_tbg"><span>' + arr[k][m] + '<i class="signIcon"></i></span>' + '</td>';
                                            }else{
                                                //判断是否是当日
                                                if(arr[k][m] == this.date){
                                                    str += '<td class="cur_day"><span class="active">' + arr[k][m] + '</span></td>';
                                                    continue;
                                                }
                                                if(arr[k][m] == ""){
                                                    str += '<td class="over"><span>' + arr[k][m] + '</span></td>';
                                                    continue;
                                                }
                                                str += '<td><span>' + arr[k][m] + '</span></td>';
                                            }
                                        }
                                        str += '</tr>';
                                    }
                                    str += '</tbody>';
                                    str += '</table>';
                                    return str;
                                };
                                Calendar.prototype.nextMonth = function() {
                                    if(this.month == 12) {
                                        this.year ++;
                                        this.month = 1;
                                    }else {
                                        this.month ++;
                                    };
                                    let preActiveDay = new Date(),preActiveDate = preActiveDay.getDate();
                //                    console.log(this.month,this.year,preActiveDate);
                                    getActiveMonth({month:this.month,year:this.year},{date:this.year+'-'+this.month+'-'+preActiveDate});
                                };
                                Calendar.prototype.prevMonth = function() {
                                    if(this.month == 1) {
                                        this.year --;
                                        this.month = 12;
                                    }else {
                                        this.month --;
                                    }
                                    let preActiveDay = new Date(),preActiveDate = preActiveDay.getDate();
                //                    console.log(this.month,this.year,preActiveDate);
                                    getActiveMonth({month:this.month,year:this.year},{date:this.year+'-'+this.month+'-'+preActiveDate});
                                };

                                window.Calendar = Calendar;
                            var Calendar = new Calendar('box', {
                                curDate: new Date()
                            });
                            var today = new Date();
                            var tMonth = today.getMonth()+1;
                            var tYear = today.getFullYear();
                            var tDate = today.getDate();
                            var contentDate = tYear+'-'+tMonth+'-'+tDate;
                            /*获取当月签到数据和当天签到数据*/
                            getActiveMonth({month:tMonth,year:tYear},{date:contentDate});
                        });
                    });
                });
            })
        },
        events:{
            "click td":"td_clicked",
            "click .sign":"sign_btn",
            "click .btn_fath":"toogle",
            "click .addIcon":"add_btn",
            "click .delete":"del_btn",
            "change .startTime":"changeStart",
            "change .client":"changeClient"
        },
        td_clicked:function(e){
            let _this = this,
                isDate = this.$(e.currentTarget).attr('class'),
                today = new Date(),
                tYear = today.getFullYear(),
                tMonth = today.getMonth()+1,
                tDate = today.getDate(),
                todayDate = `${tYear}-${tMonth}-${tDate}`,
                getTodayTime = new Date(todayDate),
                tTime = getTodayTime.getTime(),
                activeDay = this.$(e.currentTarget).text();
            if(isDate !== 'over'){
                let date = this.$('h4').text().split('-')
                date.splice(2,1,activeDay);
                let dateStr = date.join('-');
                let activeDate = new Date(dateStr);
                let activeTime = activeDate.getTime();
                if(activeTime <= tTime){
                    _this.$('h4').text(dateStr);
                    _this.$('span').removeClass('active');
                    _this.$(e.currentTarget).find('span').attr('class','active');
                    /*请求当天的签到数据*/
//                    console.log(date)
                    this.model.call("get_sign_by_date",{date:date.join('-')}).then(function(result) {
//                        console.log('当天签到情况:',result);
                        if(result[0]){
                            _this.$('.signData').html('');
                            for(let i = 0;i<result.length;i++){
                                _this.createHtml(_this.selectData,result[i]);
                            }
                            _this.$('.addIcon').hide();
                            _this.$('.delete').hide();
                            _this.$('.inputVal').attr('disabled','true');
                            $('.bottom span#signBtn').attr('class','signed').text('已签到');
                        }else{
                            _this.$('.signData').html('');
                            /*获取默认数据*/
                            _this.model.call("get_default_sign",{}).then(function(result) {
//                                console.log('默认数据',result)
                                if(result[0]){
                                    for(let i = 0;i<result.length;i++){
                                        _this.createHtml(_this.selectData,result[i]);
                                    }
                                }else{
                                    _this.add_btn();
                                }
                                _this.$('.addIcon').show();
                                $('.bottom span#signBtn').attr('class','sign').text('签到');
                            })
                        }
                    });
                }
            }
        },
        add_btn:function(e){
            let eleSign = self.$('.signData').children("ul:last-child");
            let preEndTime = eleSign.find('.endTime').val();
            let preTimeIndex = this.getTimeIndex(this.selectData.timesList,preEndTime || "09:00")
            let defaultData = {
                partner_id:'',
                project:'',
                address:'',
                work_content:'',
                default:false,
                start_time:preEndTime || '09:00',
                end_time:this.selectData.timesList[preTimeIndex+17]
            };
            this.createHtml(this.selectData,defaultData);
        },
        del_btn:function(e){
            this.$(e.currentTarget).parent().parent().parent().remove();
        },
        toogle:function(e){
            var ele = this.$(e.currentTarget).find('.move');
            if (ele.attr("data-state") == "on") {
                ele.animate({
                    left: "0"
                }, 300, function() {
                    ele.attr("data-state", "off");
                });
                this.$(e.currentTarget).removeClass("on").addClass("off");
            } else if (ele.attr("data-state") == "off") {
                ele.animate({
                    left: '30px'
                }, 300, function() {
                    $(this).attr("data-state", "on");
                });
                this.$(e.currentTarget).removeClass("off").addClass("on");
            }
        },
        changeClient:function(e){
            function strSelect(list){
                if(list){
                    if(typeof list[0] == 'object'){
                        let str = "";
                        for(let i = 0;i<list.length;i++){
                            str+=`<option value="${list[i]['id']}">${list[i]['name']}</option>`;
                        }
                        return str;
                    }else{
                        let str = "";
                        for(let i = 0;i<list.length;i++){
                            str+=`<option value="${list[i]}">${list[i]}</option>`;
                        }
                        return str;
                    }
                }
            }
            let changeVal = this.$(e.currentTarget).val();
            let element = this.$(e.currentTarget).parent().parent().find('.project');
            let projectForCli = [],allProject = this.selectData.projectList;
            for(let i = 0;i<allProject.length;i++){
                if(allProject[i].partner_id == changeVal){
                    projectForCli.push(allProject[i])
                }
            }
            element.html('').html(strSelect(projectForCli));
        },
        changeStart:function(e){
            let changeVal = this.$(e.currentTarget).val();
            let elements = this.$(e.currentTarget).parent().parent().find('.endTime');
            let index = this.getTimeIndex(this.selectData.timesList,changeVal);
            elements.find('option').removeAttr('disabled');
            elements.find('option').slice(0,index).attr('disabled','disabled');
        },
        sign_btn: function(e){
            let _this = this, signList = [],eleArr = this.$('ul'),sign_date = this.$('h4').text();
            for(let i = 0;i<eleArr.length;i++){
                let obj = {user_id:this.userData.id};
                obj.date = sign_date;
                obj.partner_id = this.$(eleArr[i]).find('.client').val();
                obj.project = this.$(eleArr[i]).find('.project').val();
                obj.start_time = this.$(eleArr[i]).find('.startTime').val();
                obj.end_time = this.$(eleArr[i]).find('.endTime').val();
                obj.address = this.$(eleArr[i]).find('.add').val();
                obj.work_content = this.$(eleArr[i]).find('.workCon').val();
                if(this.$(eleArr[i]).find('.move').attr('data-state') == 'off'){
                    obj.default = false;
                }else{
                    obj.default = true;
                }
                signList.push(obj);
            }
            if(signList[0]){
                for(let i = 0;i<signList.length;i++){
                    if(signList[i].end_time === null){
                        var $dialog=new instance.web.Dialog(null,{
                            size: 'small',
                            dialogClass: 'oe_act_window',
                            title: _t("提示")
                        },'<h3 style="text-align:center;">请检查结束时间!</h3>').open();
                        return false;
                    }
                }
                let testObj = {signList:signList};
                this.model.call("commit",testObj).then(function(result) {
                    if(result == 'ok'){
                        var $dialog=new instance.web.Dialog(null,{
                            size: 'small',
                            dialogClass: 'oe_act_window',
                            title: _t("提示")
                        },'<h3 style="text-align:center;">签到完成</h3>').open();
                        let str =`<i class="signIcon"></i>`;
                        $(str).appendTo(_this.$('.active').parent().addClass('red_tbg').find('span'));
                        _this.$('.addIcon').hide();
                        _this.$('.delete').hide();
                        _this.$('.inputVal').attr('disabled','true');
                        _this.$(e.currentTarget).attr('class','signed').text('已签到');
                    }
                });
            }else{
                var $dialog=new instance.web.Dialog(null,{
                    size: 'small',
                    dialogClass: 'oe_act_window',
                    title: _t("提示")
                },'<h3 style="text-align:center;">请添加签到内容</h3>').open();
            }
        },
        createHtml:function(selectData,defaultData){
//            console.log('下拉框数据:',this.selectData);
            function strSelect(list){
                if(list){
                    if(typeof list[0] == 'object'){
                        let str = "";
                        for(let i = 0;i<list.length;i++){
                            str+=`<option value="${list[i]['id']}">${list[i]['name']}</option>`;
                        }
                        return str;
                    }else{
                        let str = "";
                        for(let i = 0;i<list.length;i++){
                            str+=`<option value="${list[i]}">${list[i]}</option>`;
                        }
                        return str;
                    }
                }
            }
            let str = `<ul>
                    <li class="formOne">
                        <div>
                            <label>客户：<span></span></label>
                            <select class="inputVal client"><option value="">请选择客户</option>${strSelect(selectData.clientList)}</select>
                        </div>
                        <div>
                            <label>项目：</label>
                            <select class="inputVal project"><option value="">请选择项目</option>${strSelect(selectData.projectList)}</select>
                        </div>
                        <div>
                            <label>开始时间：</label>
                            <select class="inputVal startTime">${strSelect(selectData.timesList)}</select>
                        </div>
                        <div>
                            <label>结束时间：</label>
                            <select class="inputVal endTime">${strSelect(selectData.timesList)}</select>
                        </div>
                    </li>
                    <li class="formTwo">
                        <div class="address">
                            <label>地点：<span></span></label>
                            <select class="inputVal add"><option value="">请选择地点</option>${strSelect(selectData.addressList)}</select>
                        </div>
                        <div class="job">
                            <label>工作内容：</label>
                            <textarea class="inputVal workCon" style="width:84%;"></textarea>
                        </div>
                        <div class="defaultSwitch">
                            <label>设为默认：</label>
                            <div class="switch" style="position:absolute;top:-22px;">
                                <div class="btn_fath clearfix ${defaultData.default ? 'on':'off'}">
                                    <div class="move" data-state="${defaultData.default ? 'on':'off'}"></div>
                                    <div class="btnSwitch btn1">开</div>
                                    <div class="btnSwitch btn2 ">关</div>
                                </div>
                            </div>
                            <i class="delete"></i>
                        </div>
                    </li>
                </ul>`;
            $(str).appendTo('.signData');
            /*设置默认值*/
            let eleSign = self.$('.signData').children("ul:last-child");
            eleSign.find('.client').val(defaultData.partner_id);
//            console.log('联动id:',defaultData.partner_id);
            let projectForCli = [],allProject = selectData.projectList;
            for(let i = 0;i<allProject.length;i++){
                if(allProject[i].partner_id == defaultData.partner_id){
                    projectForCli.push(allProject[i])
                }
            }
            eleSign.find('.project').html('').html(strSelect(projectForCli));
            eleSign.find('.project').val(defaultData.project);
            eleSign.find('.add').val(defaultData.address);
            eleSign.find('.workCon').val(defaultData.work_content);
            eleSign.find('.startTime').val(defaultData.start_time);
            eleSign.find('.endTime').val(defaultData.end_time);
            let startIndex = this.getTimeIndex(this.selectData.timesList,defaultData.start_time);
            eleSign.find('.endTime option').slice(0,startIndex).attr('disabled','disabled');

            let preSign = self.$('.signData ul').eq(-2);
            let preEnd = preSign.find('.endTime').val();
            if(preEnd){
                let preIndex = this.getTimeIndex(this.selectData.timesList,preEnd);
                eleSign.find('.startTime option').slice(0,preIndex).attr('disabled','disabled');
            }
        },
        getTimeIndex:function(arr,item){
            let index = -1;
            arr.forEach(function(res,i){
                if(res === item && index === -1){
                    index = i;
                }
            });
            return index;
        }
    });
    instance.web.client_actions.add('petstore.homepage', 'instance.oepetstore.HomePage');
}