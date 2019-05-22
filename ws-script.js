function genResponder(ws) {
  let token;
  let command;
  let isBits = false;
  let bitsArr;
  let c = 0;

  return function (msg) {
    c += 1;
    console.log('Before parse: ', msg)
    let m = {}
    if (!isBits){
      m = JSON.parse(msg.data);
    }

    console.log('Got message: ', m);
    let reply;

    if (m.next) {
      if (!token) {
        token = m.token;
      }
      command = m.next;
      if (m.token) {

      }
      reply = JSON.stringify({token, command});

      console.log('Reply for command: ', reply)
    } else if (m.name === 'arithmetic') {
      command = m.name
      let {sign, values} = m.task;
      let answer = eval(values.join(sign));
      reply = JSON.stringify({token, command, answer})
    } else if (m.name === 'function_evaluation') {
      command = m.name
      let answer = eval(m.task.fn)();
      reply = JSON.stringify({token, command, answer});
      console.log('Reply for fun eval: ', reply)
    } else if (m.name === 'binary_arithmetic') {
      isBits = true;
      bitsArr = m.task.bits == 16 ? Uint16Array : Uint8Array
      command = m.name;
    } else if (isBits) {
      let arr = new bitsArr(msg.data)
      let answer = arr.reduce((i, sum) => i + sum)
      reply = JSON.stringify({token, command, answer})
      isBits = false;
    } else {
      throw 'cannot handle: '
    }

    console.log('Count: ', c)
    console.log('Send reply', reply)
    if (reply){
      ws.send(reply)
    }
  }
}

function run(){
  let ws = new WebSocket('ws://wsc.2123.io');
  ws.binaryType = "arraybuffer";
  ws.onmessage = genResponder(ws);
  ws.onopen = function() { ws.send(JSON.stringify({ "name":"KateZ", "command": "challenge accepted" })) }
  return ws
}

run()