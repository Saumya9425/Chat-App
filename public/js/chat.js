const socket=io()

const $messageForm=document.querySelector('#message-form')
const $messageFormInput=document.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendlocationbutton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

const messagetemplate=document.querySelector('#message-template').innerHTML
const locationmessagetemplate=document.querySelector('#location-message-template').innerHTML
const sidebartemplate=document.querySelector('#sidebar-template').innerHTML

const { username,room }=Qs.parse(location.search,{ ignoreQueryPrefix : true})

const autoscroll=()=>{
    const $newmessage=$messages.lastElementChild
    const newmessagestyles=getComputedStyle($newmessage)
    const newmessagemargin=parseInt(newmessagestyles.marginBottom)
    const newmessageheight=$newmessage.offsetHeight + newmessagemargin
    const visibleheight=$messages.offsetHeight
    const containerheight=$messages.scrollHeight
    const scrolloffset=$messages.scrollTop + visibleheight
    if(containerheight-newmessageheight<=scrolloffset){
        $messages.scrollTop=$messages.scrollHeight
    }
}
socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render(messagetemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationmessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationmessagetemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebartemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')

    const message=e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
    if(error){
       return console.log(error)
    }
    console.log('Message delivered')
})
})

$sendlocationbutton.addEventListener('click',()=>{
    if(!navigator.geolocation)
    {
        return alert('Geolocation is not supported by your browser.')
    }
    $sendlocationbutton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $sendlocationbutton.removeAttribute('disabled')
            console.log('Location shared')
        })
    })
})

socket.emit('join',{ username,room},(error)=>{
    if(error)
    {
        alert(error)
        location.href='/'
    }
})