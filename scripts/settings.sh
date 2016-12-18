# Change 'Persistent Menu' options
curl -X POST -H "Content-Type: application/json" -d '{
  "setting_type" : "call_to_actions",
  "thread_state" : "existing_thread",
  "call_to_actions":[
    {
      "type":"web_url",
      "title":"View Website",
      "url":"https://impressiv.io"
    },
    {
      "type":"postback",
      "title":"Get Today'\'s' Headlines",
      "payload":"GET_DAILY_ARTICLES"
    },
    {
      "type":"postback",
      "title":"Manage Settings",
      "payload":"EDIT_SETTINGS"
    }
  ]
}' "https://graph.facebook.com/v2.6/me/thread_settings?access_token="

# Change 'Get Started' button
curl -X POST -H "Content-Type: application/json" -d '{
  "setting_type":"call_to_actions",
  "thread_state":"new_thread",
  "call_to_actions":[
    {
      "payload":"START"
    }
  ]
}' "https://graph.facebook.com/v2.6/me/thread_settings?access_token="
