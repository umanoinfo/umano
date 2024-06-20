export const companiesTypes = [
  { title: 'Health center', icon: 'mdi:laptop', color: 'success.main', value: 'healthCenter' },
  { title: 'Clinic', icon: 'mdi:laptop', color: 'warning.main', value: 'clinic' }
]

export const EmployeesTypes = [
  { title: 'Full-time', value: 'fullTime' },
  { title: 'Part-time', value: 'partTime' },
  { title: 'Temporary work', value: 'temporaryWork' },
  { title: 'Flexible working', value: 'flexibleWorking' },
  { title: 'Remote work', value: 'remoteWork' },
  { title: 'Job sharing', value: 'jobSharing' }
]

export const EmployeesPositions = [
    {label: 'Nurse' , value:'Nurse'},
    {label: 'Physician' , value:'Physician'},
    {label: 'Dentist' , value:'Dentist'},
    {label: 'Allied Health Pharmacist' , value:'Allied Health Pharmacist'},
    {label: 'T&CAM' , value:'T&CAM'},
];

export const MaritalStatus = [
  { title: 'Single', value: 'Single' },
  { title: 'Married', value: 'Married' },
  { title: 'Divorced', value: 'Divorced' }
]

export const SourceOfHire = [
  { title: 'Jobs social media', value: 'jobsSocialMedia' },
  { title: 'Job search websites', value: 'jobSearchWebsites' },
  { title: 'Company career website', value: 'companyCareerWebsite' },
  { title: 'Employee referrals', value: 'employeeReferrals' }
]

export const HealthInsuranceTypes = [
  { title: 'Insurance1', value: 'Insurance1' },
  { title: 'Insurance2', value: 'Insurance2' }
]

export const PositionChangeStartTypes = [
  { title: 'New Employee', value: 'New Employee' },
  { title: 'Temporary Delegate', value: 'Temporary Delegate' },
  { title: 'Promotion', value: 'Promotion' },
  { title: 'Permanent Transfer', value: 'Permanent Transfer' },
  { title: 'Existing Employee' , value:'Existing Employee'},
  { title: 'other', value: 'other' }
]

export const PositionChangeEndTypes = [
  { title: 'Temporary Delegate', value: 'Temporary Delegate' },
  { title: 'Promotion', value: 'Promotion' },
  { title: 'Permanent Transfer', value: 'Permanent Transfer' },
  { title: 'other', value: 'other' }
]

export const SalaryChange = [
  { title: 'Promotion', value: 'Promotion' },
  { title: 'Financial increment', value: 'Financial increment' },
  { title: 'Violations', value: 'Violations' },
  { title: 'Fines', value: 'Fines' },
  { title: 'other', value: 'other' },
  { title:'Joining Salary' , value:'Joining Salary'}
]

export const EventType = [
  { label: 'Task', value: 'Task', color: 'info' },
  { label: 'Meet', value: 'Meet', color: 'primary' },
  { label: 'Document', value: 'Document', color: 'success' },
  { label: 'Holiday', value: 'Holiday', color: 'secondary' }
]

export const FormType = [
  { label: 'Leave', value: 'Leave' },
  { label: 'Letters and certificates', value: 'LettersCertificates' },
  { label: 'Resignation, termination, and penalties', value: 'ResignationTerminationPenalties' },
  { label: 'Recruitment', value: 'Recruitment' },
  { label: 'Other', value: 'Other' }
]

export const FormulaType = [
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Daily', value: 'Daily' },
  { label: 'Hourly', value: 'Hourly' },
  { label: 'Flexible' , value: 'Flexible'}
]

export const CompensationsType = [
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Daily', value: 'Daily' }
]

export const DeductionsType = [
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Daily', value: 'Daily' }
]

export const EmployeeDeductionsType = [
  { label: 'Absences', value: 'Absences' },
  { label: 'Violations', value: 'Violations' },
  { label: 'Fines', value: 'Fines' },
  { label: 'Loan', value: 'Loan' },
  { label: 'Utilities', value: 'Utilities' },
  { label: 'Assets damage', value: 'Assets damage' },
  { label: 'Other', value: 'Other' }
]

export const EmployeeRewardsType = [
  { label: 'Performance increment', value: 'Performance increment' },
  { label: 'Commissions', value: 'Commissions' },
  { label: 'Reimbursement', value: 'Reimbursement' },
  { label: 'Other', value: 'Other' }
]

export const countries = [
  {
    "_id":"618e8986133c2b25923f2248",
    "name": "United Arab Emirates",
    "en": "United Arab Emirates (the)",
    "es": "Emiratos Árabes Unidos (los)",
    "fr": "Ukraine",
    "ru": "Объединенные Арабские Эмираты",
    "ar": "الإمارات العربية المتحدة",
    "dial": 971,
    "ISO3": "ARE",
    "MARC": "ts",
    "FIPS": "AE",
    "ISO2": "AE",
    "currency_name": "UAE Dirham",
    "currency_code": "AED",
    "Region Name": "Asia",
    "Sub-region Name": "Western Asia",
    "Capital": "Abu Dhabi",
    "Continent": "AS",
    "Languages": "ar-AE,fa,en,hi,ur",
    "states":[{name:'Abu Dhabi'},{name:'Ajman'},{name:'Dubai'},{name:'Fujairah'},{name:'Ras al-Khaimah'},{name:'Umm al-Quwain'}]
  }
]


export const EditorOptions = [
  {
    label: 'Input Text',
    key: '--[Input Text]--',
    replace:
      "<input  type='text' style = 'margin-right: 3px ; margin-left: 3px;outline:none;border:none;border-bottom:2px dotted lightGray;'/>"
  },
  {
    label: 'Input Number',
    key: '--[Input Number]--',
    replace:
      "<input type='number' style = 'margin-right: 3px ; margin-left: 3px;outline:none;border:none;border-bottom:2px dotted lightGray'/>"
  },
  {
    label: 'Input Date',
    key: '--[Input Date]--',
    replace:
      "<input type='date' style = 'margin-right: 3px ; margin-left: 3px;outline:none;border:none;border-bottom:2px dotted lightGray'/>"
  },
  { label: 'Employee Name', key: '--[Employee Name]--', replace: '<b>Employee Name</b>' },
  { label: 'Employee Position', key: '--[Employee Position]--', replace: '<b>Employee Position</b>' },
  { label: 'Employee Date', key: '--[Employee Date]--', replace: '<b>Employee Date</b>' },
  { label: 'Employee ID', key: '--[Employee ID]--', replace: '<b>Employee ID</b>' },
  { label: 'Company Name', key: '--[Company Name]--', replace: '<b>Company Name</b>' },
  { label: 'Date', key: '--[Date]--', replace: '<b>Date</b>' },
  { label: 'Time', key: '--[Time]--', replace: '<b>Time</b>' }
]

export const GetHealthInsuranceTypes = string => {
  const selected = HealthInsuranceTypes.filter(e => {
    return e.value == string
  })

  return
}

export const GetSourceOfHire = string => {
  const selected = SourceOfHire.filter(e => {
    return e.value == string
  })

  return selected[0]?.title
}

export const GetEmployeesType = string => {
  const selected = EmployeesTypes.filter(e => {
    return e.value == string
  })

  return selected[0]?.title
}

export const GetMaritalStatus = string => {
  const selected = MaritalStatus.filter(e => {
    return e.value == string
  })

  return selected[0]?.title
}
