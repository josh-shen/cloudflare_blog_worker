addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

const corsHeaders = {
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Origin': '*'
}

async function handleRequest(request) {
  if (request.method === 'POST'){
    const body = await request.json()
    await storePost(body)   //store post in kv:namespace
    return new Response('POST'), {
      headers: {
        ...corsHeaders
      }
    }
  }
  else if (request.method === 'GET'){
    posts = await getPosts()
    return new Response(JSON.stringify(posts), {
      headers: {
        ...corsHeaders
      }
    })
  }
  else if (request.method === 'OPTIONS'){
    return new Response ('OK', {headers: corsHeaders})
  }
  else {
    return new Response("Expected POST or GET", {status: 500})
  }
}

function hash(string) {           
  var hash
  for (i = 0; i < string.length; i++) {
      char = string.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
  }
  return hash;
}
async function storePost(body){
  var value = JSON.stringify(body)
  var key = hash(value)   //generate key for value
  await POST_DATA.put(key, value)
  return key
}

function sort(posts){
  posts.sort(function(a, b){
    return new Date(b.timestamp) - new Date(a.timestamp)
  })
  return posts
}
async function getPosts(){
  const data = await POST_DATA.list()   //get keys
  var posts = []

  for (let i = 0; i < data.keys.length; i++){
    var val = await POST_DATA.get(data.keys[i].name)    //get values
    var temp = JSON.parse(val)
    posts[i] = temp
    if (val === null){
      console.log("value not found", {status: 404})
    }
  }
  sort(posts)
  return posts
}