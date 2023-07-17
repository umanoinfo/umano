// ** React Import
import { useEffect, useRef, useState } from 'react'

// ** Full Calendar & it's Plugins
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

// ** Icon Imports
import Icon from 'src/@core/components/icon'
import { useDispatch, useSelector } from 'react-redux'

import { fetchData } from 'src/store/apps/event'

const blankEvent = {
  title: '',
  start: '',
  end: '',
  allDay: false,
  url: '',
  extendedProps: {
    calendar: '',
    guests: [],
    location: '',
    description: ''
  }
}

const Calendar = props => {
  // ** Props
  const {
    params,
    direction,
    updateEvent,
    handleSelectEvent,
    handleLeftSidebarToggle,
    handleAddEventSidebarToggle,
    close,
    setUpdateEvent
  } = props

  const store = useSelector(state => state.event)

  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)

  const dispatch = useDispatch()

  //

  const [eventStatus, setEventStatus] = useState('')

  const chepColor = { Meet: 'primary', Task: 'info', Document: 'success' , Holiday: 'secondary' }

  let types = []
  types = store.data.map(el => el.type)
  types = Array.from(new Set(types))

  const events = store.data.map(el => {
    let r = { ...el }
    r.id = r._id
    r.extendedProps = {
      calendar: r.type
    }
    r.start = new Date(r.startDate)
    r.end = new Date(r.endDate)

    return r
  })
  useEffect(() => {
    dispatch(
      fetchData({
        eventType: params,
        eventStatus,
        q: value
      })
    ).then(setLoading(false))
  }, [dispatch, eventStatus, value, close, params])

  //   {
  //   id: 1,
  //   url: '',
  //   title: 'Design Review',
  //   start: date,
  //   end: nextDay,
  //   allDay: false,
  //   extendedProps: {
  //     calendar: 'Business'
  //   }
  // },

  // ** Refs
  const calendarRef = useRef()
  if (store) {
    // ** calendarOptions(Props)
    const calendarOptions = {
      events: store.data.length ? events : [],
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        start: 'sidebarToggle, prev, next, title',
        end: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
      },
      views: {
        week: {
          titleFormat: { year: 'numeric', month: 'long', day: 'numeric' }
        }
      },

      /*
            Enable dragging and resizing event
            ? Docs: https://fullcalendar.io/docs/editable
          */
      editable: true,

      /*
            Enable resizing event from start
            ? Docs: https://fullcalendar.io/docs/eventResizableFromStart
          */
      eventResizableFromStart: true,

      /*
            Automatically scroll the scroll-containers during event drag-and-drop and date selecting
            ? Docs: https://fullcalendar.io/docs/dragScroll
          */
      dragScroll: true,

      /*
            Max number of events within a given day
            ? Docs: https://fullcalendar.io/docs/dayMaxEvents
          */
      dayMaxEvents: 2,

      /*
            Determines if day names and week names are clickable
            ? Docs: https://fullcalendar.io/docs/navLinks
          */
      navLinks: true,
      eventClassNames({ event: calendarEvent }) {
        // @ts-ignore
        const colorName = chepColor[calendarEvent._def.extendedProps.calendar]

        return [
          // Background Color
          `bg-${colorName}`
        ]
      },
      eventClick({ event: clickedEvent }) {
        // dispatch(handleSelectEvent(clickedEvent))
        setUpdateEvent(clickedEvent)
        handleAddEventSidebarToggle()
      },
      customButtons: {
        sidebarToggle: {
          text: <Icon icon='mdi:menu' />,
          click() {
            handleLeftSidebarToggle()
          }
        }
      },
      dateClick(info) {
        const ev = { ...blankEvent }
        ev.start = info.date
        ev.end = info.date
        ev.allDay = true

        // @ts-ignore
        dispatch(handleSelectEvent(ev))
        handleAddEventSidebarToggle()
      },

      /*
            Handle event drop (Also include dragged event)
            ? Docs: https://fullcalendar.io/docs/eventDrop
            ? We can use `eventDragStop` but it doesn't return updated event so we have to use `eventDrop` which returns updated event
          */
      eventDrop({ event: droppedEvent }) {
        dispatch(updateEvent(droppedEvent))
      },

      /*
            Handle event resize
            ? Docs: https://fullcalendar.io/docs/eventResize
          */
      eventResize({ event: resizedEvent }) {
        dispatch(updateEvent(resizedEvent))
      },
      ref: calendarRef,

      // Get direction from app state (store)
      direction
    }

    // @ts-ignore
    return <FullCalendar {...calendarOptions} />
  } else {
    return null
  }
}

export default Calendar
