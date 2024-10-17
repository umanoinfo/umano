import toast from "react-hot-toast";

export const functions = {
  // ================================== ZKT_UA300 ==================================

  "ZKT_UA300": (data, employeesList, handleSubmit) => {
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
      for (let i = 0; i < lines.length; i++) {
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
      for (const [key, value] of map.entries()) {
        let [idNo, date] = key.split('_');
        // console.log("*******************", date, value[0])
        if (date == undefined || date == null) continue;
        let mn = new Date(date + ' ' + value[0]);
        let mx = new Date(date + ' ' + value[0]);

        // console.log("**++++++++**", date, new Date((date + ' ' + value[0]).toString()), new Date(date + 'T' + value[0] + 'Z'))

        if (mn == 'Invalid Date' || mx == 'Invalid Date') {
          // toast.error('Invalid Date format in your file please correct it to be like following: 1970-01-01');
          continue;
        }
        for (let j = 0; j < value.length; j++) {
          let time = new Date(date + ' ' + value[j]);
          mn = Math.min(mn, time);
          mx = Math.max(mx, time);

          console.log(mn, mx)
        }
        mn = new Date(mn).toLocaleTimeString('en-US', { hour12: false })
        mx = new Date(mx).toLocaleTimeString('en-US', { hour12: false })
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
  }
}