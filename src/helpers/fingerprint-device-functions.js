import toast from "react-hot-toast";
import * as XLSX from 'xlsx'

export const functions = {
  // ================================== ZKT_UA300 ==================================

  "ZKT_UA300": (data, employeesList, handleSubmit , functions ) => {
    const target = event.target;
    const reader = new FileReader()
    reader.readAsBinaryString(target.files[0])
    reader.onload = e => {
      let raw = e.target.result;
      let lines = raw.split('\n');

      const removeSpacesFromBeginning = (string) => {
        while (string.startsWith(' ')) {
          string = string.replace(' ', '');
        }

        return string;
      };
      let map = new Map();
      for (let i = 0; i < lines.length - 1; i++) {
        let line = lines[i];
        line = line.replaceAll('\t', ' ');
        let values = [];
        for (let j = 0; j < 3; j++) {
          line = removeSpacesFromBeginning(line);
          let index = line.indexOf(' ');
          let value = line.slice(0, index)
          values.push(value);

          line = line.slice(index + 1, line.length);
        }
        let key = values[0] + '_' + values[1];
        if (map.has(key)) {
          map.set(key, [...map.get(key), values[2]]);
        }
        else {
          map.set(key, [values[2]]);
        }

      }
      const EmployeesIds = new Map();

      let ids = employeesList.map(val => {
        EmployeesIds.set(String(val.idNo), val._id);

        return String(val.idNo)
      })

      let attendances = [];
      for (const [key, times] of map.entries()) {
        // key is : employeeIdNo (underscore) date
        // times contains all the times for that employee in that date 
        let [idNo, date] = key.split('_');
        date = date.replaceAll('-', '/');

        // console.log(date, "*******", times[0], "*******", new Date(date + 'T' + times[0] + 'Z'), "*******", new Date(date + '' + times[0]).toLocaleString(), "*******", new Date(date + 'T' + times[0] + 'Z').toLocaleString())

        let mn = times[0] 
        let mx = times[0]
        
        if (mn == 'Invalid Date' || mx == 'Invalid Date') {
          toast.error('Invalid Date format in your file please correct it to be like following: 1970-01-01');

          return;
        }


        for (let j = 0; j < times.length; j++) {
          // let time = new Date(date + 'T' + times[j] + 'Z');
          let time = times[j] ;
          if(time < mn ) {
            mn = time ; 
          }
          if(time > mx ){
            mx = time ; 
          }
        }
      

        // mn = excelDateToJSDate(mn);
        // mx = excelDateToJSDate(mx);
        // console.log(mn  , mx ) ;

        // mn = new Date(mn).toLocaleTimeString('en-US', { hour12: false })
        // mx = new Date(mx).toLocaleTimeString('en-US', { hour12: false })

        // console.log(mn, mx);

        if(EmployeesIds.get(String(idNo))){
          continue ;
        }
        attendances.push({
          'Emp No.': idNo,
          'Clock In': mn,
          'Clock Out': mx,
          Date: date,
          employee_id: EmployeesIds.get(String(idNo))
        });
      }
      handleSubmit(attendances);
    }

    // ================================== ...... ==================================
  },
  "excel": (data, employeesList, handleSubmit , functions ) => {
    let { setOpenExcel , setUnvalid } = functions ;
    let event = data ;
    const target = event.target
    function ExcelDateToJSDate(date) {
      return isNaN(date) ? null : new Date(Math.round((date - 25569) * 86400 * 1000))
    }
  
    function excelDateToJSDate(excel_date, time = false) {
      let day_time = excel_date % 1
      let meridiem = 'AMPM'
      let hour = Math.floor(day_time * 24)
      let minute = Math.floor(Math.abs(day_time * 24 * 60) % 60)
      let second = Math.floor(Math.abs(day_time * 24 * 60 * 60) % 60)
      if (isNaN(second) || isNaN(minute) || isNaN(hour) || isNaN(day_time)) {
        return null
      }
      hour >= 12 ? (meridiem = meridiem.slice(2, 4)) : (meridiem = meridiem.slice(0, 2))
      hour > 12 ? (hour = hour - 12) : (hour = hour)
      hour = hour < 10 ? '0' + hour : hour
      minute = minute < 10 ? '0' + minute : minute
      second = second < 10 ? '0' + second : second
      let daytime = '' + hour + ':' + minute + ':' + second + ' ' + meridiem
  
      return time
        ? daytime
        : new Date(0, 0, excel_date, 0, -new Date(0).getTimezoneOffset(), 0).toLocaleDateString(navigator.language, {}) +
        ' ' +
        daytime
    }

    if (target.files.length != 0) {
      if (target.files.length !== 1) {
        throw new Error('Cannot use multiple files')
      } else {
        const reader = new FileReader()
        reader.readAsBinaryString(target.files[0])
        reader.onload = e => {
          /* create workbook */
          const binarystr = e.target.result
          const wb = XLSX.read(binarystr, { type: 'binary' })

          /* selected the first sheet */
          const wsname = wb.SheetNames[0]
          const ws = wb.Sheets[wsname]

          /* save data */
          const data = XLSX.utils.sheet_to_json(ws) // to get 2d array pass 2nd parameter as object {header: 1}
          let EmployeesIds = new Map();

          let ids = employeesList.map(val => {
            EmployeesIds.set(String(val.idNo) , val._id) ;
            
            return String(val.idNo)
          })

          // console.log(EmployeesIds);

          let d = data.map((val, index) => {
            let timeOut = excelDateToJSDate(val['Clock Out']);
            let timeIn = excelDateToJSDate(val['Clock In']);

            timeOut = new Date(timeOut).toLocaleTimeString('en-US', { hour12: false });
            timeIn = new Date(timeIn).toLocaleTimeString('en-US', { hour12: false });
            
            return {
              'employee_id' : EmployeesIds.get(String(val['Emp No.'])),
              'Emp No.':String(val['Emp No.']),
              'Date': ExcelDateToJSDate(val['Date']),
              'Clock Out': timeOut,
              'Clock In': timeIn,
              index: index + 1 ,
            }
          }).filter((val )=>{
            return val?.employee_id ;
          })


       
          

          let unValid = d.filter(val => {
            let i = !val['Emp No.']
            let i2 = !val['Date']
            let i3 = !val['Clock Out']
            let k3 = val['Clock Out'].toUpperCase().includes('AM') || val['Clock Out'].toUpperCase().includes('PM')
            let i4 = !val['Clock In']
            let k4 = val['Clock In'].toUpperCase().includes('AM') || val['Clock In'].toUpperCase().includes('PM');
            let j = !ids.includes(val['Emp No.'].toString())
            
            // console.log(val['Emp No.'], ids, ids.includes(val['Emp No.'].toString()));
            let k5 = val['Clock In'] > val['Clock Out'];
            val.reasons = []
            val.reasons = i ? [...val.reasons, 'Emp No.'] : val.reasons
            val.reasons = i2 ? [...val.reasons, 'Date'] : val.reasons
            val.reasons = i3 ? [...val.reasons, 'Clock Out'] : val.reasons
            val.reasons = i4 ? [...val.reasons, 'Clock In'] : val.reasons
            val.reasons = j ? [...val.reasons, 'not in the system'] : val.reasons
            val.reasons = k3 ? [...val.reasons, 'Clock out should be in 24 hour format'] : val.reasons;
            val.reasons = k4 ? [...val.reasons, 'Clock In should be in 24 hour format'] : val.reasons;
            val.reasons = k5 ? [...val.reasons, 'Clock In should be smaller than clock out (double check its 24 hour format)'] : val.reasons;
            
            return i || i2 || i3 || i4 || j || k3 || k4
          })  

          if (unValid.length > 0) {
            setOpenExcel(true)
            setUnvalid(unValid)
          } else {
            handleSubmit(d)
          }
        }
      }
    }
    
  },

}