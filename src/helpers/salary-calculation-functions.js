const generalFunctions = {
    "calculateCompensations": (data) => { // compensation defined in salary formula 
        let { employee, company, fromDate, toDate, req, working_days, res } = data;
        if (employee.compensations_array) {
            let totalCompensations = 0
            employee.compensations_array.map(comp => {
                let totalValue = 0
                comp.fixedValue = Number(comp.fixedValue);
                comp.percentageValue = Number(comp.percentageValue);
                employee.totalWorkingDaysCount = Number(employee.totalWorkingDaysCount)

                if (comp.type == 'Monthly') {
                    // totalValue = totalValue + Number(comp.fixedValue) *  Math.ceil((employee.totalWorkingDaysCount/ 30))
                    totalValue = totalValue + Number(comp.fixedValue) * 1
                    totalValue = totalValue + Number((comp.percentageValue * employee.lumpySalary) / 100) * 1
                }
                if (comp.type == 'Daily') {
                    totalValue = totalValue + Number(comp.fixedValue * employee.totalWorkingDaysCount)
                    totalValue = totalValue + Number((comp.percentageValue * employee.totalWorkingDaysCount * employee.dailySalary) / 100)
                }
                comp.totalValue = Number(totalValue)
                totalCompensations = totalCompensations + totalValue
            })
            employee.totalCompensations = totalCompensations
        }
    },
    "calculateDeductions": (data) => {
        let { employee, company, fromDate, toDate, req, working_days, res } = data;
        if (employee.deductions_array) {
            let totalDeductions = 0
            employee.deductions_array.map(deduction => {
                let totalValue = 0
                deduction.fixedValue = Number(deduction.fixedValue);
                deduction.percentageValue = Number(deduction.percentageValue);
                employee.totalWorkingDaysCount = Number(employee.totalWorkingDaysCount)
                if (deduction.type == 'Monthly') {
                    // totalValue = totalValue + Number(deduction.fixedValue) * Math.ceil((employee.totalWorkingDaysCount/ 30));
                    totalValue = totalValue + Number(deduction.fixedValue) * 1;
                    totalValue = totalValue + Number((deduction.percentageValue * employee.lumpySalary) / 100) * Math.ceil((employee.totalWorkingDaysCount / 30))
                }
                if (deduction.type == 'Daily') {
                    totalValue = totalValue + Number(deduction.fixedValue * employee.totalWorkingDaysCount)
                    totalValue =
                        totalValue +
                        Number((deduction.percentageValue * employee.totalWorkingDaysCount * employee.dailySalary) / 100)
                }
                deduction.totalValue = totalValue
                totalDeductions = totalDeductions + totalValue
            })

            employee.totalDeductions = totalDeductions
        }
    },
    "calculateEmployeeDeductions": (data) => {
        // تختلف عن الخصومات العادية أنها تعطى لسبب طارئ أما الخصومات العادية تعطى كل شهر
        let { employee, company, fromDate, toDate, req, working_days, res } = data
        let totalEmployeeDeductions = 0
        if (employee.employee_deductions_info) {
            employee.employee_deductions_info.map(deduction => {
                totalEmployeeDeductions = totalEmployeeDeductions + Number(deduction.value)
            })
            employee.totalEmployeeDeductions = totalEmployeeDeductions
        }
    },
    "calculateEmployeeRewards": (data) => {
        let { employee, company, fromDate, toDate, req, working_days, res } = data
        if (employee.employee_rewards_info) {
            let totalEmployeeRewards = 0
            employee.employee_rewards_info.map(reward => {
                totalEmployeeRewards = totalEmployeeRewards + Number(reward.value)
            })
            employee.totalEmployeeRewards = totalEmployeeRewards
        }
    }
}



export const functions = {
    // =============================================================================
    // ================================== Monthly ==================================
    // =============================================================================
    "Monthly": (data) => {
        console.log('Calculating Monthly Salary');
        let { employee, company, fromDate, toDate, req, working_days, res } = data;
        employee.absenseDays = 0;

        employee.totalWorkingDaysCount = Math.ceil(Math.abs(new Date(fromDate) - new Date(toDate)) / (1000 * 60 * 60 * 24));
        employee.flexible = false;

        // employee.salaries_info = [{ lumpySalary: lumpySalary }];

        let lumpySalary = Number(employee?.salaries_info?.[0]?.lumpySalary);
        employee.lumpySalary = lumpySalary;
        employee.dailySalary = Number(lumpySalary / 30);

        // Assume Compensations 
        employee.totalSalary = lumpySalary;
        generalFunctions.calculateCompensations(data);
        employee.totalSalary += employee.totalCompensations;

        // Assume Deduction 
        generalFunctions.calculateDeductions(data);
        employee.totalSalary -= employee.totalDeductions;

        // Assume Employee Deduction 
        generalFunctions.calculateEmployeeDeductions(data);

        // Assume Employee Rewards 
        generalFunctions.calculateEmployeeRewards(data);


        // this here because of flexible
        if (!employee.salaryFormulas_info || !employee.salaryFormulas_info[0] || !employee?.shift_info || !employee?.shift_info[0] || (!employee?.salaryFormulas_info?.[0]?.type != 'Flexible' && (!employee.salaries_info || employee.salaries_info.length == 0)) || ((!company?.working_days || company?.working_days?.length == 0))) {
            let message = [];
            if (!employee.salaryFormulas_info || !employee.salaryFormulas_info?.[0]) {
                message.push('Error: define Sarlary Formula for this employee first');
            }
            console.log(employee?.shift_info, !employee?.shift_info);
            if (!employee?.shift_info || !employee?.shift_info?.[0]) {
                message.push('Error: define Shift info for this employee first');
            }

            if (!employee?.salaryFormulas_info?.[0]?.type != 'Flexible' && (!employee.salaries_info || employee.salaries_info.length == 0)) {
                message.push('Error: Add salary first (no salary defined)!');
            }
            if (!company?.working_days || company?.working_days?.length == 0) {
                message.push('Error: define working days for your company');
            }

            return res.status(400).json({ success: false, message: message });
        }
        if (employee?.shift_info?.[0]?.shiftType != 'times') {
            return res.status(400).json({
                success: false, message: [
                    'Error: Shift for this employee is defined as Total hours which does not work with selected salary formula , assign times shift then try again'
                ]
            });
        }

        let start = new Date(fromDate)
        let end = toDate
        let attendances = []
        let index = 0
        const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        let holidays = [];
        if (company.holidays) {
            holidays = company.holidays.map(day => {
                let holidayDate = new Date(day.date).toLocaleDateString().split('/');

                return holidayDate[0] + '/' + holidayDate[1];
            })
        }
        employee.absenseDays = 0;
        let totalWorkingDaysCount = 0;
        console.log(start, end);
        if (employee)
            for (let x = start; x <= end;) {

                index++
                let _in = null
                let _out = null
                let earlyFlag = false // It represents lateness when working in the morning
                let lateFlag = false // It represents lateness when working in the evening
                let earlyOvertimeFlag = false; // It represents overtime when working before work in the morning
                let lateOvertimeFlag = false;// It represents overtime when working after work in the evening
                let totalHours = 0
                let earlyHours = 0
                let lateHours = 0
                let earlyOverTimeHours = 0
                let lateOverTimeHours = 0
                let day = ''
                let holidayDay = false
                let leaveDay = false
                let leaveHourly = false
                let leavePaidValue = 0
                let leaves = []
                day = new Date(x).getDay() // index 
                let workingDay = working_days.includes(weekday[day]) // boolean
                let dateFormate = new Date(x).toLocaleDateString()
                if (company?.holidays) {
                    let isHoliday = dateFormate.split('/');

                    holidayDay = holidays.includes(isHoliday[0] + '/' + isHoliday[1]) // boolean
                }


                // ----------------------- leaves ------------------------------------
                let totalLeaveHours = 0;
                if (employee?.leaves_info) { // each day we may have more than one leave 
                    employee.leaves_info?.map(leave => {

                        var dateFrom = new Date(leave.date_from).setUTCHours(0, 0, 0, 0);
                        var dateTo = new Date(leave.date_to).setUTCHours(0, 0, 0, 0);
                        var dateCheck = x.setUTCHours(0, 0, 0, 0);
                        if (dateCheck >= dateFrom && dateCheck <= dateTo) {
                            if (leave.type == 'daily') {
                                leaveDay = true
                            }
                            if (leave.type == 'hourly') {
                                leaveHourly = true
                                totalLeaveHours += (Math.abs(dateTo - dateFrom) / 3600000).toFixed(2)
                            }
                            leaves.push(leave)
                        }

                        return new Date(day.date).toLocaleDateString()
                    })
                }

                // -----------------------------------------------------------------
                // console.log(employee) ;


                const setUTCHours = (time) => {
                    let date = new Date('1/1/2023');
                    date.setUTCHours(Number(time.split(':')[0]), Number(time.split(':')[1]));
                    date = new Date(date);

                    return date;
                }

                let shift_in = setUTCHours(employee.shift_info?.[0]?.times?.[0].timeIn.toString());
                let shift_out = setUTCHours(employee.shift_info?.[0]?.times?.[0].timeOut.toString())
                let availableEarly = setUTCHours(employee.shift_info?.[0]?.times?.[0].availableEarly.toString())// the amount of delay that doesn't count (in the morning)
                let availableLate = setUTCHours(employee.shift_info?.[0]?.times?.[0].availableLate.toString())// the amount of delay that doesn't count (in the afternoon)
                let shiftOverTime1 = setUTCHours(employee.shift_info?.[0]?.times?.[0]['1st'].toString())
                let shiftOverTime2 = setUTCHours(employee.shift_info?.[0]?.times?.[0]['2nd'].toString())
                let shiftOverTime3 = setUTCHours(employee.shift_info?.[0]?.times?.[0]['3rd'].toString())

                // ----------------------- Absence days -----------------------------------------

                if (!leaveDay && !holidayDay && workingDay) {
                    lateFlag = true // initlizing it to true (assuming employee didn't attend ) then check if he did....
                    lateHours = ((shift_out - shift_in) / 3600000)
                }


                // -------------------------------------------------------------

                if (employee?.attendances_info) {
                    if (!leaveDay) {
                        employee.attendances_info?.map(att => {
                            if (new Date(x).toLocaleDateString() == new Date(att.date).toLocaleDateString()) {

                                _in = setUTCHours(att.timeIn.toString());
                                _out = setUTCHours(att.timeOut.toString());

                                earlyFlag = false
                                earlyHours = 0
                                lateFlag = false
                                lateHours = 0


                                totalHours = (
                                    (Math.min(shift_out, _out) - Math.max(shift_in, _in)) / 3600000
                                )

                                // ---------------- late ---------------------
                                if (!holidayDay && workingDay) // in holidays & off days lateness doesn't count
                                    if (_in > availableEarly) {
                                        lateFlag = true
                                        lateHours = (Math.abs(_in - shift_in) / 3600000).toFixed(2)
                                    }
                                if (!holidayDay && workingDay) // in holidays & off days lateness doesn't count
                                    if (_out < availableLate) {
                                        earlyFlag = true
                                        earlyHours = (Math.abs(shift_out - _out) / 3600000).toFixed(2)
                                    }

                                // -------------------- overtime -----------------------
                                if (workingDay) {
                                    if (_in < shift_in) {
                                        earlyOvertimeFlag = true
                                        earlyOverTimeHours = ((shift_in - _in) / 3600000).toFixed(2)
                                    }
                                    if (_out > shift_out) {
                                        lateOvertimeFlag = true
                                        lateOverTimeHours = ((_out - shift_out) / 3600000).toFixed(2)
                                    }
                                }
                                else {
                                    if (_in < shift_in) {
                                        earlyOvertimeFlag = true;
                                        if (holidayDay) {
                                            earlyOverTimeHours = (((shift_in - _in) / 3600000).toFixed(2) * employee.salaryFormulas_info[0].holidayOverTime).toFixed(2);
                                        }
                                        else if (!workingDay) { // off day ( weekend )
                                            earlyOverTimeHours = (((shift_in - _in) / 3600000).toFixed(2) * employee.salaryFormulas_info[0].weekendOverTime).toFixed(2);
                                        }

                                    }
                                }
                                _in = _in.toISOString().substr(11, 8)
                                _out = _out.toISOString().substr(11, 8)

                            }

                        })
                    }
                }

                // في حال كان يوم دوام وهو مداوم (يحسب يوم دوام )
                // يوم دوام وهو مو مداوم (لا يحسب )
                // في حال كان يوم عطلة أو يوم إجازة رسمية يحسب بغض النظر عن الدوام

                if ((workingDay && _in) || holidayDay || !workingDay)
                    totalWorkingDaysCount++;
                if (workingDay && !_in && !leaveDay) {
                    employee.absenseDays++;
                }
                attendances.push({
                    day: weekday[new Date(x).getDay()] + " --- " + new Date(x).getUTCDay() + " --- " + new Date(x).getDay(),
                    workingDay: workingDay,
                    id: index,
                    date: new Date(x).toLocaleDateString(),
                    dateuts: new Date(x).getUTCDate(),
                    datelocal: new Date(x).toLocaleDateString(),
                    datex: x,
                    _in: _in,
                    _out: _out,
                    lateFlag: lateFlag,
                    earlyFlag: earlyFlag,
                    earlyOvertimeFlag: earlyOvertimeFlag,
                    lateOverTimeHours: lateOverTimeHours,
                    lateHours: lateHours,
                    earlyHours: earlyHours,
                    totalHours: totalHours,
                    lateOvertimeFlag: lateOvertimeFlag,
                    lateOverTimeHours: lateOverTimeHours,
                    holidayDay: holidayDay,
                    leaveDay: leaveDay,
                    leaveHourly: leaveHourly,
                    leaves: leaves,
                    totalLeaveHours: totalLeaveHours
                })
                x = new Date(x.getTime() + 1000 * 60 * 60 * 24);
            }

        //   ----------------------- Assume hourly Salary -------------------------------
        employee.dailySalary = (employee.salaries_info[0].lumpySalary / 30) //  Daily Salary
        employee.hourlySalary = (employee.dailySalary / (
            (new Date('1/1/2023 ' + employee.shift_info?.[0]?.times?.[0].timeOut.toString() + ' UTC') -
                new Date('1/1/2023 ' + employee.shift_info?.[0]?.times?.[0].timeIn.toString() + ' UTC')) / 3600000
        )
        )
        let totalEarlyOverTimeHours = 0 // overtime hours (morning)
        let totalLateOverTimeHours = 0// overtime hours (evening)

        //   ------------------------ Assume Early & Late OverTime Hours -------------------------------

        attendances.map(att => {
            totalEarlyOverTimeHours = totalEarlyOverTimeHours + Number(att.earlyOverTimeHours)
            totalLateOverTimeHours = totalLateOverTimeHours + Number(att.lateOverTimeHours)
        })

        employee.totalEarlyOverTimeHours = totalEarlyOverTimeHours
        employee.totalLateOverTimeHours = totalLateOverTimeHours

        employee.totalEarlyOverTimeValue = (
            +totalEarlyOverTimeHours *
            +employee.hourlySalary *
            +employee.salaryFormulas_info[0].firstOverTime
        )

        employee.totalLateOverTimeValue = (
            +totalLateOverTimeHours *
            +employee.hourlySalary *
            +employee.salaryFormulas_info[0].firstOverTime
        )


        let totalholidayHours = 0
        let totalEarlyHours = 0 // lateness hours (morning)
        let totalLateHours = 0 // lateness hours (evening)
        let totalOffDayHours = 0; // days that company are not working in.

        //   ----------------------- Assume Early & Late Hours -------------------------------
        attendances.map(att => {

            totalEarlyHours = totalEarlyHours + Number(att.earlyHours)
            totalLateHours = totalLateHours + Number(att.lateHours)
            if (att.holidayDay) {
                totalholidayHours = totalholidayHours + +Number(att.totalHours)
            }
            if (!att.holidayDay && !att.workingDay) { // ???????????? 
                totalOffDayHours = totalOffDayHours + Number(att.totalHours)
            }
        })
        employee.totalWorkingDaysCount = totalWorkingDaysCount
        employee.totalholidayHours = totalholidayHours

        employee.totalholidayValue = (
            +totalholidayHours *
            +employee.hourlySalary *
            +employee.salaryFormulas_info[0].holidayOverTime
        )

        employee.totalOffDayHours = totalOffDayHours
        employee.totalOffDayValue = (
            +totalOffDayHours *
            +employee.hourlySalary *
            +employee.salaryFormulas_info[0].weekendOverTime
        )
        employee.totalEarlyHours = totalEarlyHours
        employee.totalLateHours = totalLateHours
        employee.totalEarlyValue =
            (Number(employee.totalEarlyHours + employee.totalLateHours) *
                Number(employee.salaryFormulas_info[0].notJustifiedAbsenceHoure) * // those hours are not justified because justified hours (are in leaves)
                Number(employee.hourlySalary) *
                -1)



        //   --------------------------- Assume Leaves -------------------------------------------------

        if (employee.leaves_info) {
            let totalLeave = 0;// this value will be subtracted from total salary
            let shift_out = new Date('1/1/2023 ' + employee.shift_info?.[0]?.times?.[0].timeOut.toString() + ' UTC')
            let shift_in = new Date('1/1/2023 ' + employee.shift_info?.[0]?.times?.[0].timeIn.toString() + ' UTC')

            employee.leaves_info.map(leave => {
                let from = new Date(leave.date_from).setUTCHours(0, 0, 0, 0)
                let to = new Date(leave.date_to).setUTCHours(0, 0, 0, 0)
                if (leave.type == "daily") {

                    let days = ((to - from) / (1000 * 60 * 60 * 24)) + 1
                    let cur = new Date(leave.date_from + ' UTC');
                    let intersectedDays = 0;
                    for (let i = 0; i < days; i++) {

                        if (cur >= fromDate && cur <= toDate) {
                            intersectedDays++;
                        }
                        cur = new Date(cur.getTime() + 1000 * 60 * 60 * 24);
                    }

                    leave.time = (((shift_out - shift_in) * intersectedDays) / 3600000)
                    leave.days = intersectedDays
                    totalLeave = totalLeave + Number(((intersectedDays * employee.dailySalary * (100 - leave.paidValue)) / 100))
                    leave.value = (Number((Number(leave.days) * employee.dailySalary * (100 - Number(leave.paidValue))) / 100).toFixed(3));
                }
                if (leave.type == "hourly") {
                    let cur = new Date(leave.date_from).setUTCHours(0, 0, 0, 0);
                    if (cur >= fromDate && cur <= toDate) {
                        leave.time = ((new Date(leave.date_to) - new Date(leave.date_from)) / 3600000)
                        totalLeave = totalLeave + Number((((leave.time * employee.hourlySalary) * (100 - leave.paidValue)) / 100))
                    }
                    leave.value = Number(((Number(leave.time) * employee.hourlySalary) * (100 - Number(leave.paidValue))) / 100).toFixed(3);
                }
            })

            employee.totalLeave = (totalLeave)
        }

        employee = [employee];

        return res.status(200).json({ success: true, data: employee, attendances: attendances })

    },

    // ==============================================================================
    // ================================== Flexible ==================================
    // ==============================================================================
    "Flexible": (data) => {
        console.log('Calculating Flexible Salary');
        let { employee, company, fromDate, toDate, req, working_days, res } = data;
        let lumpySalary = 0;
        employee.totalWorkingDaysCount = Math.ceil(Math.abs(new Date(fromDate) - new Date(toDate)) / (1000 * 60 * 60 * 24));
        employee.flexible = true;
        lumpySalary = Number(req.body.data.lumpySalary);
        employee.salaries_info = [{ lumpySalary: lumpySalary }];

        lumpySalary = Number(lumpySalary);
        employee.lumpySalary = lumpySalary;
        employee.dailySalary = Number(lumpySalary / 30);

        // Assume Compensations 
        employee.totalSalary = lumpySalary;
        generalFunctions.calculateCompensations(data);
        employee.totalSalary += employee.totalCompensations;

        // Assume Deduction 
        generalFunctions.calculateDeductions(data);
        employee.totalSalary -= employee.totalDeductions;

        // Assume Employee Deduction 
        generalFunctions.calculateEmployeeDeductions(data);

        // Assume Employee Rewards 
        generalFunctions.calculateEmployeeRewards(data);

        /// Validation 

        employee.absenseDays = 0;
        if (employee.flexible) {
            return res.status(200).json({ success: true, data: [employee] });
        }
    },









    // =======================================================================================
    // ================================== MonthlyTotalHours ==================================
    // =======================================================================================
    "MonthlyTotalHours": (data) => {

        console.log('Calculating MonthlyTotalHours Salary');
        let { employee, company, fromDate, toDate, req, working_days, res } = data;
        console.log(employee?.shift_info?.[0]?.totalHours);
        employee.absenseDays = 0;
        let lumpySalary = 0;
        employee.totalWorkingDaysCount = Math.ceil(Math.abs(new Date(fromDate) - new Date(toDate)) / (1000 * 60 * 60 * 24));

        lumpySalary = Number(employee?.salaries_info?.[0]?.lumpySalary);
        employee.lumpySalary = Number(lumpySalary)
        employee.dailySalary = Number(lumpySalary / 30);
        employee.hourlySalary = Number(lumpySalary / Number(employee.salaryFormulas_info[0].totalHours));

        // Assume Compensations 
        employee.totalSalary = lumpySalary;
        generalFunctions.calculateCompensations(data);
        employee.totalSalary += employee.totalCompensations;

        // Assume Deduction 
        generalFunctions.calculateDeductions(data);
        employee.totalSalary -= employee.totalDeductions;

        // Assume Employee Deduction 
        generalFunctions.calculateEmployeeDeductions(data);

        // Assume Employee Rewards 
        generalFunctions.calculateEmployeeRewards(data);


        // this here because of flexible
        if (!employee.salaryFormulas_info || !employee.salaryFormulas_info[0] || !employee?.shift_info || !employee?.shift_info?.[0] || (!employee?.salaryFormulas_info?.[0]?.type != 'Flexible' && (!employee.salaries_info || employee.salaries_info.length == 0)) || ((!company?.working_days || company?.working_days?.length == 0))) {
            let message = [];
            if (!employee.salaryFormulas_info || !employee.salaryFormulas_info?.[0]) {
                message.push('Error: define Sarlary Formula for this employee first');
            }
            console.log(employee?.shift_info, !employee?.shift_info);
            if (!employee?.shift_info || !employee?.shift_info?.[0]) {
                message.push('Error: define Shift info for this employee first');
            }

            if (!employee?.salaryFormulas_info?.[0]?.type != 'Flexible' && (!employee.salaries_info || employee.salaries_info.length == 0)) {
                message.push('Error: Add salary first (no salary defined)!');
            }
            if (!company?.working_days || company?.working_days?.length == 0) {
                message.push('Error: define working days for your company');
            }

            return res.status(400).json({ success: false, message: message });
        }
        console.log(employee?.shift_info?.[0]?.shiftType);

        if (employee?.shift_info?.[0]?.shiftType == 'times') {
            return res.status(400).json({
                success: false, message: [
                    'Error: Shift for this employee is defined as times which does not work with selected salary formula , assign total hours shift then try again'
                ]
            });
        }

        let totalRequiredHours = Number(employee.salaryFormulas_info[0].totalHours)


        let start = new Date(fromDate)
        let end = toDate
        let attendances = []
        let index = 0
        const weekday = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        let holidays = [];
        if (company.holidays) {
            holidays = company.holidays.map(day => {
                let holidayDate = new Date(day.date).toLocaleDateString().split('/');

                return holidayDate[0] + '/' + holidayDate[1];
            })
        }
        employee.absenseDays = 0;
        let totalWorkingDaysCount = 0;
        let totalWorkingHours = 0;
        console.log(start, end);
        if (employee)
            for (let x = start; x <= end;) {

                index++
                let _in = null
                let _out = null
                let earlyFlag = false // It represents lateness when working in the morning
                let lateFlag = false // It represents lateness when working in the evening
                let earlyOvertimeFlag = false; // It represents overtime when working before work in the morning
                let lateOvertimeFlag = false;// It represents overtime when working after work in the evening
                let totalHours = 0
                let earlyHours = 0
                let lateHours = 0
                let earlyOverTimeHours = 0
                let lateOverTimeHours = 0
                let day = ''
                let holidayDay = false
                let leaveDay = false
                let leaveHourly = false
                let leavePaidValue = 0
                let leaves = []
                day = new Date(x).getDay() // index 
                let workingDay = working_days.includes(weekday[day]) // boolean
                let dateFormate = new Date(x).toLocaleDateString()
                if (company?.holidays) {
                    let isHoliday = dateFormate.split('/');

                    holidayDay = holidays.includes(isHoliday[0] + '/' + isHoliday[1]) // boolean
                }


                // ----------------------- leaves ------------------------------------
                let totalLeaveHours = 0;
                if (employee?.leaves_info) { // each day we may have more than one leave 
                    employee.leaves_info?.map(leave => {

                        var dateFrom = new Date(leave.date_from).setUTCHours(0, 0, 0, 0);
                        var dateTo = new Date(leave.date_to).setUTCHours(0, 0, 0, 0);
                        var dateCheck = x.setUTCHours(0, 0, 0, 0);
                        if (dateCheck >= dateFrom && dateCheck <= dateTo) {
                            if (leave.type == 'daily') {
                                leaveDay = true
                            }
                            if (leave.type == 'hourly') {
                                leaveHourly = true
                                totalLeaveHours += (Math.abs(dateTo - dateFrom) / 3600000).toFixed(2)
                            }
                            leaves.push(leave)
                        }

                        return new Date(day.date).toLocaleDateString()
                    })
                }

                // -----------------------------------------------------------------
                // console.log(employee) ;


                const setUTCHours = (time) => {
                    let date = new Date('1/1/2023');
                    date.setUTCHours(Number(time.split(':')[0]), Number(time.split(':')[1]));
                    date = new Date(date);

                    return date;
                }


                // -------------------------------------------------------------

                if (employee?.attendances_info) {
                    if (!leaveDay) {
                        employee.attendances_info?.map(att => {
                            if (new Date(x).toLocaleDateString() == new Date(att.date).toLocaleDateString()) {
                                _in = setUTCHours(att.timeIn.toString());
                                _out = setUTCHours(att.timeOut.toString());
                                totalHours = (
                                    ((_out) - (_in)) / 3600000
                                )
                                totalWorkingHours += totalHours;
                                _in = _in.toISOString().substr(11, 8)
                                _out = _out.toISOString().substr(11, 8)
                            }

                        })
                    }
                }

                // في حال كان يوم دوام وهو مداوم (يحسب يوم دوام )
                // يوم دوام وهو مو مداوم (لا يحسب )
                // في حال كان يوم عطلة أو يوم إجازة رسمية يحسب بغض النظر عن الدوام

                if (_in)
                    totalWorkingDaysCount++;
                attendances.push({
                    day: weekday[day],
                    workingDay: workingDay,
                    id: index,
                    date: new Date(x),
                    _in: _in,
                    _out: _out,
                    lateFlag: lateFlag,
                    earlyFlag: earlyFlag,
                    earlyOvertimeFlag: earlyOvertimeFlag,
                    lateOverTimeHours: lateOverTimeHours,
                    lateHours: lateHours,
                    earlyHours: earlyHours,
                    totalHours: totalHours,
                    lateOvertimeFlag: lateOvertimeFlag,
                    lateOverTimeHours: lateOverTimeHours,
                    holidayDay: holidayDay,
                    leaveDay: leaveDay,
                    leaveHourly: leaveHourly,
                    leaves: leaves,
                    totalLeaveHours: totalLeaveHours
                })
                x = new Date(x.getTime() + 1000 * 60 * 60 * 24);
            }

        //   ----------------------- Assume hourly Salary -------------------------------
        employee.dailySalary = (employee.lumpySalary / 30) //  Daily Salary
        employee.hourlySalary = (employee.lumpySalary / totalRequiredHours)

        let totalEarlyOverTimeHours = 0 // overtime hours (morning)
        let totalLateOverTimeHours = 0// overtime hours (evening)
        employee.totalEarlyOverTimeHours = totalEarlyOverTimeHours
        employee.totalLateOverTimeHours = totalLateOverTimeHours


        let totalholidayHours = 0
        let totalEarlyHours = 0 // lateness hours (morning)
        let totalLateHours = 0 // lateness hours (evening)
        let totalOffDayHours = 0; // days that company are not working in.

        //   ----------------------- Assume Early & Late Hours -------------------------------
        attendances.map(att => {

            totalEarlyHours = totalEarlyHours + Number(att.earlyHours)
            totalLateHours = totalLateHours + Number(att.lateHours)
            if (att.holidayDay) {
                totalholidayHours = totalholidayHours + +Number(att.totalHours)
            }
            if (!att.holidayDay && !att.workingDay) { // ???????????? 
                totalOffDayHours = totalOffDayHours + Number(att.totalHours)
            }
        })
        employee.totalWorkingDaysCount = totalWorkingDaysCount
        employee.totalholidayHours = totalholidayHours



        //   --------------------------- Assume Leaves -------------------------------------------------

        if (employee.leaves_info) {
            let totalLeave = 0;// this value will be subtracted from total salary
            employee.leaves_info.map(leave => {
                let from = new Date(leave.date_from).setUTCHours(0, 0, 0, 0)
                let to = new Date(leave.date_to).setUTCHours(0, 0, 0, 0)
                if (leave.type == "daily") {

                    let days = ((to - from) / (1000 * 60 * 60 * 24)) + 1
                    let cur = new Date(leave.date_from + ' UTC');
                    let intersectedDays = 0;
                    for (let i = 0; i < days; i++) {

                        if (cur >= fromDate && cur <= toDate) {
                            intersectedDays++;
                        }
                        cur = new Date(cur.getTime() + 1000 * 60 * 60 * 24);
                    }

                    let totalHours = Number(employee?.shift_info?.[0]?.totalHours ?? 0)
                    leave.time = (((totalHours) * intersectedDays) / 3600000)
                    leave.days = intersectedDays
                    totalLeave = totalLeave + Number(((intersectedDays * employee.dailySalary * (leave.paidValue)) / 100))
                    leave.value = (Number((Number(leave.days) * employee.dailySalary * (Number(leave.paidValue))) / 100));

                }
                if (leave.type == "hourly") {
                    let cur = new Date(leave.date_from).setUTCHours(0, 0, 0, 0);
                    if (cur >= fromDate && cur <= toDate) {
                        leave.time = ((new Date(leave.date_to) - new Date(leave.date_from)) / 3600000)
                        totalLeave = totalLeave + Number((((leave.time * employee.hourlySalary) * (leave.paidValue)) / 100))
                    }
                    leave.value = Number(((Number(leave.time) * employee.hourlySalary) * (Number(leave.paidValue))) / 100);

                }
            })

            employee.totalLeave = (totalLeave)
        }
        totalEarlyHours = (totalWorkingHours > totalRequiredHours ? totalWorkingHours - totalRequiredHours : 0);
        totalLateHours = (totalWorkingHours < totalRequiredHours ? totalRequiredHours - totalWorkingHours : 0);
        employee.totalWorkingHours = totalWorkingHours;
        employee.totalLateOverTimeValue = (
            +totalLateOverTimeHours *
            +employee.hourlySalary *
            +employee.salaryFormulas_info[0].firstOverTime
        )
        employee.totalEarlyOverTimeValue = (
            +totalEarlyOverTimeHours *
            +employee.hourlySalary *
            +employee.salaryFormulas_info[0].firstOverTime
        )

        employee.totalholidayValue = (
            +totalholidayHours *
            +employee.hourlySalary *
            +employee.salaryFormulas_info[0].holidayOverTime
        )

        employee.totalOffDayHours = totalOffDayHours
        employee.totalOffDayValue = (
            +totalOffDayHours *
            +employee.hourlySalary *
            +employee.salaryFormulas_info[0].weekendOverTime
        )
        employee.totalEarlyHours = totalEarlyHours
        employee.totalLateHours = totalLateHours
        employee.totalEarlyValue =
            (Number(employee.totalEarlyHours + employee.totalLateHours) *
                Number(employee.salaryFormulas_info[0].notJustifiedAbsenceHoure) * // those hours are not justified because justified hours (are in leaves)
                Number(employee.hourlySalary) *
                -1)



        employee = [employee];

        return res.status(200).json({ success: true, data: employee, attendances: attendances })


    }


















}