openerp.oepetstore = function(instance, local) {
    var _t = instance.web._t,
        _lt = instance.web._lt;
    var QWeb = instance.web.qweb;

    local.HomePage = instance.Widget.extend({
        template: "HomePage",
        selectData:null,
        init: function(parent) {
            this._super(parent);
            var _this = this;
            this.model = new instance.web.Model("oepetstore.message_of_the_day");
            this.model.call("my_method").then(function(result) {
                console.log(result)
                console.log()
            })
        },
        start: function () {
            var self = this;
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
                        console.log(nowT,nextT);
                        console.log(viewMonth,viewYear);
                        if(nextT <= nowT){
                            self.model.call("my_method",{month:tMonth,year:tYear}).then(function(result) {
                                let arr = result.signDates;
                                me.nextMonth(['3','4']);
                                /*请求当天的签到数据*/
                                let today = self.$('h4').text();
                                self.model.call("testForm",{date:today}).then(function(result) {
                                    var dataList = [
                                        {
                                            defClient:'客户甲',
                                            defPro:'项目天',
                                            defStart:'08:30',
                                            defEnd:'12:30',
                                            defAdd:'地点下',
                                            defContent:'这是测试的内容1',
                                            isSwitch:true
                                        },
                                        {
                                            defClient:'客户丙',
                                            defPro:'项目天',
                                            defStart:'13:00',
                                            defEnd:'18:30',
                                            defAdd:'地点左',
                                            defContent:'这是测试的内容2',
                                            isSwitch:false
                                        }
                                    ];
                                    let isSigned = false;
                                    if(isSigned){
                                        self.$('.signData').html('');
                                        for(let i = 0;i<dataList.length;i++){
                                            self.createHtml(self.selectData,dataList[i]);
                                        }
                                        self.$('.addIcon').hide();
                                        self.$('.delete').hide();
                                        self.$('.inputVal').attr('disabled','true');
                                        $('.bottom span#signBtn').attr('class','signed').text('已签到');
                                    }else{
                                        let defaultData = {
                                            defClient:'客户丙',
                                            defPro:'项目天',
                                            defStart:'09:00',
                                            defEnd:'12:30',
                                            defAdd:'地点左',
                                            defContent:'这是默认数据',
                                            isSwitch:false
                                        }
                                        self.createHtml(self.selectData,defaultData);
                                        self.$('.delete').hide();
                                    }
                                });
                            });
                           /* self.model.call("my_method",{month:viewMonth,year:viewYear}).then(function(result) {
                                let arr = result.signDates;
                                me.nextMonth(arr)
                            });*/
                        }
                    });
                    me.main.querySelector('#prevMonth').addEventListener('click', function(e) {
                        let viewMonth = me.month,viewYear = me.year;
                        if(viewMonth == 1) {
                            viewYear --;
                            viewMonth = 12;
                        }else {
                            viewMonth --;
                        }
                        console.log(viewMonth,viewYear)
                        me.prevMonth(['11','22']);
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
                                    str += '<td class="cur_day"><span>' + arr[k][m] + '</span></td>';
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
                Calendar.prototype.nextMonth = function(dayArr) {
                    if(this.month == 12) {
                        this.year ++;
                        this.month = 1;
                    }else {
                        this.month ++;
                    };
                    this.init(dayArr);
                };
                Calendar.prototype.prevMonth = function(dayArr) {
                    if(this.month == 1) {
                        this.year --;
                        this.month = 12;
                    }else {
                        this.month --;
                    }
                    this.init(dayArr);
                };

                window.Calendar = Calendar;
            var Calendar = new Calendar('box', {
                curDate: new Date()
            });
            var today = new Date();
            var tMonth = today.getMonth()+1;
            var tYear = today.getFullYear();
            /*获取下拉框数据 - 测试*/
            this.model.call("my_method",{}).then(function(result) {
                self.selectData = {
                    clientList:['客户甲','客户乙','客户丙'],
                    projectList:['项目天','项目南','项目北'],
                    addressList:['地点上','地点下','地点左'],
                    timesList:['00:00','00:30','01:00','01:30','02:00','02:30','03:00','03:30','04:00','04:30','05:00','05:30','06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00','22:30','23:00','23:30']
                }
            });
            /*请求当月签到数据*/
            this.model.call("my_method",{month:tMonth,year:tYear}).then(function(result) {
                let arr = result.signDates;
                Calendar.init(arr);
                /*请求当天的签到数据*/
                self.model.call("testForm",{date:today}).then(function(result) {
                    var dataList = [
                        {
                            defClient:'客户甲',
                            defPro:'项目天',
                            defStart:'08:30',
                            defEnd:'12:30',
                            defAdd:'地点下',
                            defContent:'这是测试的内容1',
                            isSwitch:true
                        },
                        {
                            defClient:'客户丙',
                            defPro:'项目天',
                            defStart:'13:00',
                            defEnd:'18:30',
                            defAdd:'地点左',
                            defContent:'这是测试的内容2',
                            isSwitch:false
                        }
                    ];
                    let isSigned = false;
                    if(isSigned){
                        self.$('.signData').html('');
                        for(let i = 0;i<dataList.length;i++){
                            self.createHtml(self.selectData,dataList[i]);
                        }
                        self.$('.addIcon').hide();
                        self.$('.delete').hide();
                        self.$('.inputVal').attr('disabled','true');
                        $('.bottom span#signBtn').attr('class','signed').text('已签到');
                    }else{
                        let defaultData = {
                            defClient:'客户丙',
                            defPro:'项目天',
                            defStart:'09:00',
                            defEnd:'12:30',
                            defAdd:'地点左',
                            defContent:'这是默认数据',
                            isSwitch:false
                        }
                        self.createHtml(self.selectData,defaultData);
                        self.$('.delete').hide();
                    }
                });
            });
            Array.prototype.unique = function() {
                this.sort();
                var re = [this[0]];
                for(var i = 1; i <this.length; i++) {
                    if(this[i] !== re[re.length-1]) {
                        re.push(this[i]);
                    }
                }
                return re;
            };
        },
        events:{
            "click td":"td_clicked",
            "click .sign":"sign_btn",
            "click .btn_fath":"toogle",
            "click .addIcon":"add_btn",
            "click .delete":"del_btn",
            "change .startTime":"changeStart"
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
                    this.model.call("testForm",{date:date}).then(function(result) {
                        let dataList = [
                            {
                                defClient:'客户甲',
                                defPro:'项目天',
                                defStart:'08:30',
                                defEnd:'12:30',
                                defAdd:'地点下',
                                defContent:'这是测试点击的内容1',
                                isSwitch:true
                            },
                            {
                                defClient:'客户丙',
                                defPro:'项目天',
                                defStart:'13:00',
                                defEnd:'18:30',
                                defAdd:'地点左',
                                defContent:'这是测试点击的内容2',
                                isSwitch:false
                            }
                        ];
                        let isSigned = true;
                        if(isSigned){
                            _this.$('.signData').html('');
                            for(let i = 0;i<dataList.length;i++){
                                _this.createHtml(_this.selectData,dataList[i]);
                            }
                            _this.$('.addIcon').hide();
                            _this.$('.delete').hide();
                            _this.$('.inputVal').attr('disabled','true');
                            $('.bottom span#signBtn').attr('class','signed').text('已签到');
                        }else{
                            _this.$('.signData').html('');
                            let defaultData = {
                                defClient:'客户丙',
                                defPro:'项目天',
                                defStart:'09:00',
                                defEnd:'12:30',
                                defAdd:'地点左',
                                defContent:'这是点击默认数据',
                                isSwitch:false
                            }
                            _this.createHtml(_this.selectData,defaultData);
                            _this.$('.addIcon').show();
                            _this.$('.delete').hide();
                            $('.bottom span#signBtn').attr('class','sign');
                        }
                    });
                }

            }
        },
        add_btn:function(e){
            let eleSign = self.$('.signData').children("ul:last-child");
            let preEndTime = eleSign.find('.endTime').val();
            let preTimeIndex = this.getTimeIndex(this.selectData.timesList,preEndTime)
            let defaultData = {
                defClient:'',
                defPro:'',
                defAdd:'',
                defContent:'',
                isSwitch:false,
                defStart:preEndTime,
                defEnd:this.selectData.timesList[preTimeIndex+8]
            };
            this.createHtml(this.selectData,defaultData);
        },
        del_btn:function(e){
            this.$(e.currentTarget).parent().parent().parent().remove();
        },
        toogle:function(e){
            var ele = this.$(e.currentTarget).find('.move');
            if (ele.attr("data-state") == "on") {
                console.log('关闭')
                ele.animate({
                    left: "0"
                }, 300, function() {
                    ele.attr("data-state", "off");
                });
                this.$(e.currentTarget).removeClass("on").addClass("off");
            } else if (ele.attr("data-state") == "off") {
                console.log('开启')
                ele.animate({
                    left: '30px'
                }, 300, function() {
                    $(this).attr("data-state", "on");
                });
                this.$(e.currentTarget).removeClass("off").addClass("on");
            }
        },
        changeStart:function(e){
            let changeVal = this.$(e.currentTarget).val();
            let elements = this.$(e.currentTarget).parent().parent().find('.endTime');
            let index = this.getTimeIndex(this.selectData.timesList,changeVal);
//            elements.val(this.selectData.timesList[index+8]);
            elements.find('option').removeAttr('disabled');
            elements.find('option').slice(0,index).attr('disabled','disabled');
        },
        sign_btn: function(e){
            let _this = this, signList = [],eleArr = this.$('ul');
            console.log(this.$('ul').length)
            for(let i = 0;i<eleArr.length;i++){
                let obj = {};
                obj.client = this.$(eleArr[i]).find('.client').val();
                obj.project = this.$(eleArr[i]).find('.project').val();
                obj.startTime = this.$(eleArr[i]).find('.startTime').val();
                obj.endTime = this.$(eleArr[i]).find('.endTime').val();
                obj.add = this.$(eleArr[i]).find('.add').val();
                obj.workCon = this.$(eleArr[i]).find('.workCon').val();
                if(this.$(eleArr[i]).find('.move').attr('data-state') == 'off'){
                    obj.isDef = false;
                }else{
                    obj.isDef = true;
                }
                signList.push(obj);
            }
            console.log(signList);
            for(let i = 0;i<signList.length;i++){
                if(signList[i].endTime === null){
                    alert('请检查结束时间');
                    return false;
                }
            }
            this.model.call("my_method",signList).then(function(result) {
                if(true){
                    alert('签到成功')
                    let str =`<i class="signIcon"></i>`;
                    $(str).appendTo(_this.$('.cur_day').addClass('red_tbg').find('span'));
                    _this.$('.addIcon').hide();
                    _this.$('.delete').hide();
                    _this.$('.inputVal').attr('disabled','true');
                    _this.$(e.currentTarget).attr('class','signed').text('已签到');
                }
            });
        },
        createHtml:function(selectData,defaultData){
            function strSelect(list){
                let str = "";
                for(let i = 0;i<list.length;i++){
                    str+=`<option value="${list[i]}">${list[i]}</option>`;
                }
                return str;
            }
            let str = `<ul>
                    <li class="formOne">
                        <div>
                            <label>客户：<span></span></label>
                            <select class="inputVal client" placeholder="请选择客户">${strSelect(selectData.clientList)}</select>
                        </div>
                        <div>
                            <label>项目：</label>
                            <select class="inputVal project" placeholder="请选择项目">${strSelect(selectData.projectList)}</select>
                        </div>
                        <div>
                            <label>开始时间：</label>
                            <select class="inputVal startTime"  placeholder="请选择开始时间">${strSelect(selectData.timesList)}</select>
                        </div>
                        <div>
                            <label>结束时间：</label>
                            <select class="inputVal endTime"  placeholder="请选择结束时间">${strSelect(selectData.timesList)}</select>
                        </div>
                    </li>
                    <li class="formTwo">
                        <div class="address">
                            <label>地点：<span></span></label>
                            <select class="inputVal add" placeholder="请选择地点">${strSelect(selectData.addressList)}</select>
                        </div>
                        <div class="job">
                            <label>工作内容：</label>
                            <textarea class="inputVal workCon" style="width:84%;"></textarea>
                        </div>
                        <div class="defaultSwitch">
                            <label>设为默认：</label>
                            <div class="switch" style="position:absolute;top:-22px;">
                                <div class="btn_fath clearfix ${defaultData.isSwitch ? 'on':'off'}">
                                    <div class="move" data-state="${defaultData.isSwitch ? 'on':'off'}"></div>
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
            eleSign.find('.client').val(defaultData.defClient);
            eleSign.find('.project').val(defaultData.defPro);
            eleSign.find('.add').val(defaultData.defAdd);
            eleSign.find('.workCon').val(defaultData.defContent);
            eleSign.find('.startTime').val(defaultData.defStart);
            eleSign.find('.endTime').val(defaultData.defEnd);
            let startIndex = this.getTimeIndex(this.selectData.timesList,defaultData.defStart);
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