class controllerLoad extends dragDrop {
  constructor() {
    super()
    this.id = this.getID();
    this.svgIcons = {
      config: `<svg class="configSvgEx0A" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M487.4 315.7l-42.6-24.6c4.3-23.2 4.3-47 0-70.2l42.6-24.6c4.9-2.8 7.1-8.6 5.5-14-11.1-35.6-30-67.8-54.7-94.6-3.8-4.1-10-5.1-14.8-2.3L380.8 110c-17.9-15.4-38.5-27.3-60.8-35.1V25.8c0-5.6-3.9-10.5-9.4-11.7-36.7-8.2-74.3-7.8-109.2 0-5.5 1.2-9.4 6.1-9.4 11.7V75c-22.2 7.9-42.8 19.8-60.8 35.1L88.7 85.5c-4.9-2.8-11-1.9-14.8 2.3-24.7 26.7-43.6 58.9-54.7 94.6-1.7 5.4.6 11.2 5.5 14L67.3 221c-4.3 23.2-4.3 47 0 70.2l-42.6 24.6c-4.9 2.8-7.1 8.6-5.5 14 11.1 35.6 30 67.8 54.7 94.6 3.8 4.1 10 5.1 14.8 2.3l42.6-24.6c17.9 15.4 38.5 27.3 60.8 35.1v49.2c0 5.6 3.9 10.5 9.4 11.7 36.7 8.2 74.3 7.8 109.2 0 5.5-1.2 9.4-6.1 9.4-11.7v-49.2c22.2-7.9 42.8-19.8 60.8-35.1l42.6 24.6c4.9 2.8 11 1.9 14.8-2.3 24.7-26.7 43.6-58.9 54.7-94.6 1.5-5.5-.7-11.3-5.6-14.1zM256 336c-44.1 0-80-35.9-80-80s35.9-80 80-80 80 35.9 80 80-35.9 80-80 80z"/></svg>`,
      disket: `<?xml version="1.0" encoding="UTF-8"?>
<svg class="disketSvgEx0A" width="438.53px" height="438.53px" enable-background="new 0 0 438.533 438.533" version="1.1" viewBox="0 0 438.533 438.533" xml:space="preserve" xmlns="http://www.w3.org/2000/svg">
  <path d="m432.82 121.05c-3.806-9.132-8.377-16.367-13.709-21.695l-79.941-79.942c-5.325-5.325-12.56-9.895-21.696-13.704-9.131-3.805-17.508-5.708-25.12-5.708h-264.95c-7.611 0-14.084 2.663-19.414 7.993-5.33 5.327-7.992 11.799-7.992 19.414v383.72c0 7.617 2.662 14.089 7.992 19.417 5.33 5.325 11.803 7.991 19.414 7.991h383.72c7.618 0 14.089-2.666 19.417-7.991 5.325-5.328 7.987-11.8 7.987-19.417v-264.95c0-7.616-1.902-15.99-5.708-25.129zm-250.1-75.372c0-2.474 0.905-4.611 2.714-6.423 1.807-1.804 3.949-2.708 6.423-2.708h54.819c2.468 0 4.609 0.902 6.417 2.708 1.813 1.812 2.717 3.949 2.717 6.423v91.362c0 2.478-0.91 4.618-2.717 6.427-1.808 1.803-3.949 2.708-6.417 2.708h-54.819c-2.474 0-4.617-0.902-6.423-2.708-1.809-1.812-2.714-3.949-2.714-6.427v-91.362zm146.18 356.31h-219.27v-109.64h219.27v109.64zm73.094 0h-36.559v-118.77c0-7.617-2.663-14.085-7.991-19.417-5.328-5.328-11.8-7.994-19.41-7.994h-237.54c-7.614 0-14.087 2.666-19.417 7.994-5.327 5.328-7.992 11.8-7.992 19.417v118.77h-36.545v-365.45h36.544v118.77c0 7.615 2.662 14.084 7.992 19.414 5.33 5.327 11.803 7.993 19.417 7.993h164.46c7.61 0 14.089-2.666 19.41-7.993 5.325-5.327 7.994-11.799 7.994-19.414v-118.77c2.854 0 6.563 0.95 11.136 2.853 4.572 1.902 7.806 3.805 9.709 5.708l80.232 80.23c1.902 1.903 3.806 5.19 5.708 9.851 1.909 4.665 2.857 8.33 2.857 10.994v255.81z"/>
</svg>`
    }
  }
  async getID(request) {
    let notes = document.querySelectorAll('.noteEx0A');
    let id;
    if (notes.length > 0) {
      id = notes[notes.length - 1].idnote;
      id++;
    }
    else {
      id = 1;
    }
    if (request) {
      let repeat = true;
      let key = id;
      return await new Promise(async (resolve, reject) => {
        do {
          let res = await new Promise(async (resolve, reject) => {
            let note = await this.getStorage([request.url + key])
            if (note != "empty") {
              reject();
            }
            else {
              resolve(key);
            }
          }).then(function(ID) {
            repeat = false;
            resolve(ID);
          }, () => {
            key++
          });
        } while (repeat == true);
      });
    }
    else {
      return id;
    }
  }
  cleanNotesPageDynamic() {
    document.querySelectorAll('.removeEx0A').forEach(function(element, index) {
      let text = document.querySelector('#paperEx' + element.id.replace('removeEx', ""))
      if (text.value != "") {
        element.delete();
      }
    });
  }
  async loadNotes(request) {
    let marginFail = 50;
    let count = 0;
    for (let i = 1; i < 200; i++) {
      const note = await this.getStorage(request.url + i);
      count = note != "empty" ? 0 : count++;
      if (count > marginFail) {
        break;
      }
      if (note != "empty") {
        let exist = document.getElementById('noteEx' + note.id);
        if (!exist) {
          this.createNote(note, i);
        }
      }
    }
  }
}
class noteText extends controllerLoad {
  constructor() {
    super();
    this.temp = [];
    this.default = {
      position: 'center',
      width: '4.3cm',
      height: '4.3cm',
      fontSize: '28px',
      textContent: ""
    }
  }
  async setConfigContainer(model, id, request) {
    model.menu.style.backgroundColor = request.noteColor;
    this.on(model.iconConfig, 'click', () => {
      this.animate(model.menu, {
        opacity: '0',
        visibility: 'hidden'
      }, {
        opacity: '1',
        visibility: 'visible'
      }, 60, true)
    });
    window.addEventListener('click', (e) => {
      if (!model.menu.contains(e.target)) {
        this.css(model.menu, {
          opacity: '0',
          visibility: 'hidden'
        })
        model.menu.toggleAction = 'open';
      }
    });
    model.menu.insertAdjacentHTML('beforeend', `
            <span>Texto</span><br>
              <input type="number" value="` + model.text.style.fontSize.replace('px', '') + `" /> px<br>
            <span>Color</span><br>
              <div class="colorsEx0A" id="colorsEx` + id + `">
  
              </div>
    `);
  }
  async createNote(request, control_id = 'auto') {
    let id = control_id == 'auto' ? await this.getID(request) : control_id;
    this.id = id;
    this.requestFormat(request);
    let model = this.getModelTextNote(id, request);
    this.setRequest(model, request);
    this.setConfigContainer(model, id, request);
    this.onDelete(model, id);
    this.onAutoSave(model, id, request);
    this.onShowInfo(model, id);
    this.setNoteDOM(model.fusion());
    this.onDrag("#" + model.note.id, "#" + model.area.id);
    this.setPosition(model, request.position);
    this.onConfigColor(model, request, id)
    this.onConfigTenxSize(model, request, id);
    document.querySelector("#" + model.iconConfig.id + " svg").style.fill = request.fontColor;
    document.querySelector("#" + model.save.id + " svg").style.fill = request.fontColor;
    return id;
  }
  async saveTextNote(model, request, id, time = 10) {
    if (model.text.value != "") {
      if (this.temp[id]) {
        clearTimeout(this.temp[id]);
      }
      this.temp[id] = setTimeout(
        () => {
          let id = model.note.idnote;
          this.setStorage(request.url + id, {
            fontSize: model.text.style.fontSize,
            fontColor: request.fontColor,
            noteColor: request.noteColor,
            text: model.text.value,
            id: id,
            url: request.url,
            position: {
              x: model.note.style.left,
              y: model.note.style.top
            },
            width: model.text.clientWidth + 'px',
            height: model.text.clientHeight + 'px',
            tackColor: request.tackColor
          });
          model.info.show(null);
        }, time);
    }
  }
  onDelete(model, id) {
    model.span.delete = () => {
      document.body.removeChild(document.getElementById('areaEx' + id));
    }
    model.span.addEventListener('click', async () => {
      await this.removeStorage([
        model.span.idExtension
      ]);
      model.span.delete();
    }, false);
  }
  onShowInfo(model, id) {
    model.info.show = function(message, time = 2000) {
      this.textContent = message;
      if (message != null) {
        this.style.setProperty('height', 'auto', 'important');
        this.style.setProperty('padding', '2px 4px', 'important');
      }
      else {
        model.save.style.opacity = '1';
      }
      return setTimeout(
        () => {
          this.textContent = "";
          this.style.setProperty('height', '0', 'important');
          this.style.setProperty('padding', '0px 0px', 'important');
          model.save.style.opacity = '0';
        }, time)
    }
  }
  setNoteDOM(note) {
    note.style.height = document.body.clientHeight + 'px';
    let referenceNode = () => {
      let ID = this.getID();
      if (ID == 1) {
        return document.body.children[0];
      }
      else {
        return document.body.children[ID];
      }
    }
    document.body.insertBefore(note, referenceNode());
  }
  onAutoSave(model, id, request) {
    model.saveAuto = (time) => {
      let eventResize = (time, model, request, id) => {
        var width = model.text.clientWidth,
          height = model.text.clientHeight
        model.text.addEventListener("mouseup", () => {
          if (model.text.clientWidth != width || model.text.clientHeight != height) {
            this.saveTextNote(model, request, id, time);
          }
          width = model.text.clientWidth;
          height = model.text.clientHeight;
        });
      }
      model.text.addEventListener('keyup', (e) => {
        this.saveTextNote(model, request, id, 2000)
      });
      model.note.addEventListener('dragend', (e) => {
        this.saveTextNote(model, request, id)
      });
      eventResize(50, model, request, id);
    }
    model.saveAuto(2000);
  }
  setRequest(model, request) {
    model.note.style.background = request.noteColor;
    model.text.value = request.text;
    this.css(model.text, {
      color: request.fontColor,
      width: request.width,
      height: request.height,
      fontSize: request.fontSize,
      lineHeight: request.fontSize
    });
    model.menu.style.color = request.fontColor;
    model.tack.style.backgroundColor = request.tackColor;
  }
  getModelTextNote(id, request) {
    let create = (tag, name) => {
      let el = document.createElement(tag);
      el.classList += name + 'Ex0A notranslate';
      el.id = name + "Ex" + id;
      el.idnote = id;
      el.idExtension = request.url + el.idnote;
      return el;
    }
    let icons = this.svgIcons;
    return {
      area: create('div', 'area'),
      note: create('div', 'note'),
      span: create('span', 'remove'),
      tack: create('div', 'tack'),
      info: create('span', 'message'),
      text: create('textarea', 'paper'),
      iconConfig: create('button', 'config'),
      menu: create('ul', 'menuConfig'),
      save: create('span', 'saveIcon'),
      fusion: function() {
        this.tack.appendChild(this.span);
        this.note.appendChild(this.info);
        this.note.appendChild(this.tack);
        this.save.insertAdjacentHTML('beforeend', icons.disket);
        this.note.appendChild(this.save);
        this.note.appendChild(this.text);
        this.iconConfig.insertAdjacentHTML('beforeend', icons.config);
        this.note.appendChild(this.iconConfig);
        this.note.appendChild(this.menu);
        this.area.appendChild(this.note);
        return this.area;
      }
    }
  }
  requestFormat(request) {
    request.position = request.position ? request.position : this.default.position;
    request.width = request.width ? request.width : this.default.width;
    request.height = request.height ? request.height : this.default.height;
    request.fontSize = request.fontSize ? request.fontSize : this.default.fontSize;
    request.text = request.text ? request.text : this.default.textContent;
  }
  setPosition(model, position) {
    let centerNote = (model) => {
      this.css(model.note, {
        position: 'absolute',
        top: (window.scrollY + (model.note.clientHeight / 2)) + "px",
        left: model.note.offsetLeft + 'px',
        visibility: 'visible'
      });
      model.area.style.visibility = 'hidden';
    }
    let setCoord = (x, y) => {
      this.css(model.note, {
        position: 'absolute',
        top: y,
        left: x,
        visibility: 'visible'
      });
      model.area.style.visibility = 'hidden';
    }
    position == 'center' ? centerNote(model) : setCoord(position.x, position.y)
  }
  onConfigTenxSize(model, request, id) {
    let input = document.querySelector('#' + model.menu.id + ' input');
    this.on(input, 'change', () => {
      this.css(model.text, {
        fontSize: input.value + 'px',
        lineHeight: input.value + 'px'
      })
      this.saveTextNote(model, request, id);
    }, );
  }
  async onConfigColor(model, request, id) {
    let addColor = (response, model, id) => {
      let color = document.createElement('div');
      color.style.backgroundColor = response.note;
      document.querySelector('#colorsEx' + id).appendChild(color);
      color.addEventListener('click', () => {
        this.css([model.note, model.menu], {
          backgroundColor: response.note,
          color: response.font
        });
        model.tack.style.backgroundColor = response.tack;
        model.text.style.color = response.font;
        document.querySelector("#" + model.iconConfig.id + " svg").style.fill = response.font;
        document.querySelector("#" + model.save.id + " svg").style.fill = response.font;
        request.tackColor = response.tack;
        request.noteColor = response.note;
        request.fontColor = response.font;
        this.saveTextNote(model, request, id, 50);
      }, false);
    }
    let response = await this.getStorage('pallete-default');
    for (let i in response) {
      addColor(response[i], model, id);
    }
  }
}