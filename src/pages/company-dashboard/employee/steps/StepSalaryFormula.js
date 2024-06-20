// ** React Imports
import { useEffect, useRef, useState } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { Divider, SelectPicker, TagPicker } from 'rsuite'

// ** Axios Imports
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import { Tab } from '@mui/material'

const StepSalary = ({ handleNext, getEmployee, employee, salaryFormula, deductions, compensations }) => {
  const [loading, setLoading] = useState(false)
  const [positionChangeStartTypes, setPositionChangeStartTypes] = useState([])
  const [salaryFormulaOptions, setSalaryFormulaOptions] = useState([])
  const [deductionsOptions, setDeductionsOptions] = useState([])
  const [compensationsOptions, setCompensationsOptions] = useState([])
  const [selectedCompensations, setSelectedCompensations] = useState([])
  const [selectedDeductions, setSelectedDeductions] = useState([])
  const [selectedSalaryFormula, setSelectedSalaryFormula] = useState()
  const [selectedSalaryFormulaID, setSelectedSalaryFormulaID] = useState()
  const [tabValue, setTabValue] = useState('CompensationAndDeductions')
  const [tabs, setTabs] = useState([])


  // ----------------------- build ------------------------------------

  useEffect(() => {
    if (employee) {
      getOptions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ----------------------------- Get Options ----------------------------------

  const getOptions = async () => {
    let tempSalary = []
    let tempCompensations = []
    let tempDeductions = []

    if (salaryFormula) {
      salaryFormula.map(e => {
        tempSalary.push({ label: e.title, value: e._id, type: e.type })
      })
      setSalaryFormulaOptions(tempSalary)
      setSelectedSalaryFormula(salaryFormula.find(x => x._id == employee.salary_formula_id))
      setSelectedSalaryFormulaID(employee.salary_formula_id)
    }

    if (compensations) {
      compensations.map(e => {
        tempCompensations.push({ label: e.title + ' (' + e.type + ')', value: e._id })
      })
      setCompensationsOptions(tempCompensations)
      setSelectedCompensations(employee.compensations)
    }

    if (deductions) {
      deductions.map(e => {
        tempDeductions.push({ label: e.title + ' (' + e.type + ')', value: e._id })
      })
      setDeductionsOptions(tempDeductions)
      setSelectedDeductions(employee.deductions)
    }
  }

  // ------------------------------- Submit --------------------------------------

  const handleSubmit = () => {
    let data = {}
    data._id = employee._id
    data.salary_formula_id = selectedSalaryFormula._id
    data.deductions = selectedDeductions
    data.compensations = selectedCompensations
    setLoading(true);
    axios
      .post('/api/company-employee/edit-salary-formula/', {
        data
      })
      .then(e => {
        getEmployee(4).then(() => {
          toast.success('Salary Formula Updated Successfully.', {
            delay: 3000,
            position: 'bottom-right'
          })
          setLoading(false)
        })
      }).catch((err) => { })
  }

  const changeSalary = e => {
    let salaryFormula_ = salaryFormula.find(x => x._id == e);

    let tabs_ = [
      { value: 'EndOfService', label: 'End of service' },
      { value: 'Leave', label: 'Leave' },
      { value: 'Absence', label: 'Absence' },
      { value: 'Over Time', label: 'Over Time' },

    ];

    if (salaryFormula_.type == 'Flexible') {
      tabs_.push({ value: 'CompensationAndDeductions', label: 'Compensation & Deductions' });
    }
    setTabs(tabs_)
    setSelectedSalaryFormula(salaryFormula_)
    setSelectedSalaryFormulaID(salaryFormula_)
  }

  const changeCompensations = e => {
    setSelectedCompensations(e)
  }

  const changeDeductions = e => {
    setSelectedDeductions(e)
  }

  const handleChange = (event, newValue) => {
    console.log(event, newValue);
    setTabValue(newValue)
  }

  // ------------------------------- handle Edit --------------------------------------

  if (!employee) {
    return <Typography sx={{ mt: 2, mb: 3, px: 2, fontWeight: 400, fontSize: 15, color: 'red', textAlign: 'center', fontStyle: 'italic' }}>You must insert employee ..</Typography>
  }

  return (
    <Grid spacing={6}>
      <Grid item xs={12} lg={12}>
        <Grid container spacing={1}>
          {/* --------------------------- View ------------------------------------ */}
          <Typography sx={{ mt: 2, mb: 3, px: 2, fontWeight: 600, fontSize: 20, color: 'blue' }}
            onClick={() => router.push('/company-dashboard/payroll/formula')}
            style={{ cursor: 'pointer' }}
          >
            Salary Formula
          </Typography>

          {/* ------------------------ view Formula -------------------------------------- */}

          <Grid xs={12} md={7} lg={12} sx={{ px: 1, mt: 2 }}>
            <small >Change Salary Formula</small>
            <SelectPicker
              data={salaryFormulaOptions}

              // value={selectedSalaryFormulaID}
              onChange={e => {

                changeSalary(e)
              }}
              block
            />
            {setSelectedSalaryFormula && (
              <Grid item size='sm' sm={12} md={12} sx={{ mt: 2 }}>
                <TabContext value={tabValue}>
                  <TabList variant='fullWidth' onChange={handleChange} aria-label='full width tabs example'>
                    <Tab value='Over Time' label='Over Time' hidden={selectedSalaryFormula && selectedSalaryFormula.type == 'Flexible'} />
                    <Tab value='Absence' label='Absence' hidden={selectedSalaryFormula && selectedSalaryFormula.type == 'Flexible'} />
                    <Tab value='Leave' label='Leave' hidden={selectedSalaryFormula && selectedSalaryFormula.type == 'Flexible'} />
                    <Tab value='EndOfService' label='End of service' hidden={selectedSalaryFormula && selectedSalaryFormula.type == 'Flexible'} />
                    <Tab value='CompensationAndDeductions' label='Compensation & Deductions' />


                    {/* { 
                       tabs.map(val=>{
                        <Tab value={val.value} label={val.label} />
                       })
                    } */}
                  </TabList>
                  <TabPanel value='Over Time'>
                    <Typography sx={{ mt: 5, mb: 5 }}>Over Time</Typography>
                    <Grid item sm={12} md={4}>
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                          Over time :
                        </Typography>
                        {selectedSalaryFormula && selectedSalaryFormula.firstOverTime && (
                          <Typography sx={{ fontWeight: 500 }}>{selectedSalaryFormula.firstOverTime}</Typography>
                        )}
                        <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                          Hour/s
                        </Typography>
                      </Box>
                      {/* <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                          Second over time :
                        </Typography>
                        {selectedSalaryFormula && selectedSalaryFormula.secondOverTime && (
                          <Typography sx={{ fontWeight: 500 }}>{selectedSalaryFormula.secondOverTime}</Typography>
                        )}
                        <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                          houre
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                          Third over time :
                        </Typography>
                        {selectedSalaryFormula && selectedSalaryFormula.thirdOverTime && (
                          <Typography sx={{ fontWeight: 500 }}>{selectedSalaryFormula.thirdOverTime}</Typography>
                        )}
                        <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                          houre
                        </Typography>
                      </Box> */}

                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                          Holiday :
                        </Typography>
                        {selectedSalaryFormula && selectedSalaryFormula.holidayOverTime && (
                          <Typography sx={{ fontWeight: 500 }}>{selectedSalaryFormula.holidayOverTime}</Typography>
                        )}
                        <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                          Hour/s
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                          Weekend :
                        </Typography>
                        {selectedSalaryFormula && selectedSalaryFormula.weekendOverTime && (
                          <Typography sx={{ fontWeight: 500 }}>{selectedSalaryFormula.weekendOverTime}</Typography>
                        )}
                        <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                          Hour/s
                        </Typography>
                      </Box>
                    </Grid>
                  </TabPanel>

                  <TabPanel value='Absence'>
                    <Grid container spacing={1} sx={{ px: 5 }}>
                      <Grid item sm={12} md={6}>
                        <Typography sx={{ mt: 5, mb: 5 }}>Absence Days</Typography>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Justified :
                          </Typography>
                          {selectedSalaryFormula && selectedSalaryFormula.justifiedAbsenceDay && (
                            <Typography sx={{ fontWeight: 500 }}>
                              {selectedSalaryFormula.justifiedAbsenceDay}
                            </Typography>
                          )}
                          <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                            Day/s
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Not Justified :
                          </Typography>
                          {selectedSalaryFormula && selectedSalaryFormula.notJustifiedAbsenceDay && (
                            <Typography sx={{ fontWeight: 500 }}>
                              {selectedSalaryFormula.notJustifiedAbsenceDay}
                            </Typography>
                          )}
                          <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                            Day/s
                          </Typography>
                        </Box>

                      </Grid>
                      <Grid item sm={12} md={6}>
                        <Typography sx={{ mt: 5, mb: 1 }}>Absence Houre</Typography>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Justified :
                          </Typography>
                          {selectedSalaryFormula && selectedSalaryFormula.justifiedAbsenceHoure && (
                            <Typography sx={{ fontWeight: 500 }}>
                              {selectedSalaryFormula.justifiedAbsenceHoure}
                            </Typography>
                          )}
                          <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                            Hour/s
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Not Justified :
                          </Typography>
                          {selectedSalaryFormula && selectedSalaryFormula.notJustifiedAbsenceHoure && (
                            <Typography sx={{ fontWeight: 500 }}>
                              {selectedSalaryFormula.notJustifiedAbsenceHoure}
                            </Typography>
                          )}
                          <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                            Hour/s
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </TabPanel>


                  <TabPanel value='Leave'>
                    <Grid container spacing={1} sx={{ px: 5 }}>
                      <Grid item sm={12} md={6}>
                        <Typography sx={{ mt: 5, mb: 5 }}>Leave</Typography>

                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Paid Leave :
                          </Typography>
                          {selectedSalaryFormula && selectedSalaryFormula.paidLeave && (
                            <Typography sx={{ fontWeight: 500 }}>
                              {selectedSalaryFormula.paidLeave}
                            </Typography>
                          )}
                          <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                            %
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Unpaid Leave :
                          </Typography>
                          {selectedSalaryFormula && selectedSalaryFormula.unpaidLeave && (
                            <Typography sx={{ fontWeight: 500 }}>
                              {selectedSalaryFormula.unpaidLeave}
                            </Typography>
                          )}
                          <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                            %
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Sick Leaves :
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            &emsp;&emsp; From 1 to 15
                          </Typography>
                          {selectedSalaryFormula && selectedSalaryFormula.sickLeaveFrom1To15 && (
                            <Typography sx={{ fontWeight: 500 }}>
                              {selectedSalaryFormula.sickLeaveFrom1To15}
                            </Typography>
                          )}
                          <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                            %
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            &emsp;&emsp; From 16 to 30
                          </Typography>
                          {selectedSalaryFormula && selectedSalaryFormula.sickLeaveFrom16To30 && (
                            <Typography sx={{ fontWeight: 500 }}>
                              {selectedSalaryFormula.sickLeaveFrom16To30}
                            </Typography>
                          )}
                          <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                            %
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            &emsp; &emsp; From 31 to 90
                          </Typography>
                          {selectedSalaryFormula && selectedSalaryFormula.sickLeaveFrom31To90 && (
                            <Typography sx={{ fontWeight: 500 }}>
                              {selectedSalaryFormula.sickLeaveFrom31To90}
                            </Typography>
                          )}
                          <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                            %
                          </Typography>
                        </Box>
                        {/* <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                          Maternity Leave :
                          </Typography>
                          {selectedSalaryFormula && selectedSalaryFormula.maternityLeave && (
                            <Typography sx={{ fontWeight: 500 }}>
                              {selectedSalaryFormula.maternityLeave}
                            </Typography>
                          )}
                          <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                          %
                          </Typography>
                        </Box> */}
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Parental Leaves :
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            &emsp;&emsp; From 1 to 45
                          </Typography>
                          {selectedSalaryFormula && selectedSalaryFormula.parentalLeaveFrom1To45 && (
                            <Typography sx={{ fontWeight: 500 }}>
                              {selectedSalaryFormula.parentalLeaveFrom1To45}
                            </Typography>
                          )}
                          <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                            %
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            &emsp;&emsp; From 46 to 60
                          </Typography>
                          {selectedSalaryFormula && selectedSalaryFormula.parentalLeaveFrom46To60 && (
                            <Typography sx={{ fontWeight: 500 }}>
                              {selectedSalaryFormula.parentalLeaveFrom46To60}
                            </Typography>
                          )}
                          <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                            %
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            &emsp;&emsp; From 61 to 105
                          </Typography>
                          {selectedSalaryFormula && selectedSalaryFormula.parentalLeaveFrom61To105 && (
                            <Typography sx={{ fontWeight: 500 }}>
                              {selectedSalaryFormula.parentalLeaveFrom61To105}
                            </Typography>
                          )}
                          <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                            %
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item sm={12} md={6}>
                      </Grid>
                    </Grid>
                  </TabPanel>

                  <TabPanel value='EndOfService'>
                    <Grid container spacing={1} sx={{ px: 5 }}>
                      <Grid item sm={12} md={12}>
                        <Typography sx={{ mt: 5, mb: 5 }}>End of service compensation</Typography>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            From 1 to 5 Hour/s :
                          </Typography>
                          {selectedSalaryFormula && selectedSalaryFormula.compensationFrom1To5 && (
                            <Typography sx={{ fontWeight: 500 }}>
                              {selectedSalaryFormula.compensationFrom1To5}
                            </Typography>
                          )}
                          <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                            Day/s
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            More than 5 Hour/s :
                          </Typography>
                          {selectedSalaryFormula && selectedSalaryFormula.compensationMoreThan5 && (
                            <Typography sx={{ fontWeight: 500 }}>
                              {selectedSalaryFormula.compensationMoreThan5}
                            </Typography>
                          )}
                          <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                            Day/s
                          </Typography>
                        </Box>
                        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                          <Typography variant='body2' sx={{ mr: 1, width: '100%' }}>
                            Maximum end of service compensation :
                          </Typography>
                          {selectedSalaryFormula && selectedSalaryFormula.maxCompensation && (
                            <Typography sx={{ fontWeight: 500 }}>{selectedSalaryFormula.maxCompensation}</Typography>
                          )}
                          <Typography variant='body2' sx={{ ml: 2, width: '100%' }}>
                            Year/s
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </TabPanel>
                  <TabPanel value='CompensationAndDeductions'>
                    <Grid container spacing={1} sx={{ px: 5 }}>
                      <Grid item sm={12} md={12}>
                        <small>Add Compensations</small>
                        <TagPicker
                          data={compensationsOptions}
                          value={selectedCompensations}
                          onChange={e => {
                            changeCompensations(e)
                          }}
                          block
                        />
                        <Divider></Divider>
                        <small>Add Deductions</small>
                        <TagPicker
                          data={deductionsOptions}
                          value={selectedDeductions}
                          onChange={e => {
                            changeDeductions(e)
                          }}
                          block
                        />
                      </Grid>
                    </Grid>
                  </TabPanel>
                </TabContext>
              </Grid>
            )}


            <Box sx={{ display: 'flex', alignItems: 'right', minHeight: 40, mt: 8 }}>
              {!loading && (
                <>
                  <Button color='success' onClick={handleSubmit} variant='contained' sx={{ mr: 3 }} disabled={!selectedSalaryFormula?._id}  >
                    Save
                  </Button>
                </>
              )}
            </Box>
          </Grid>

          {/* ------------------------ view Formula -------------------------------------- */}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default StepSalary
