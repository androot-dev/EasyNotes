class controllerLoad extends dragDrop {
  constructor() {
    super()
    this.id = this.getID();
    this.palleteActive = ['#2f3640', '#fd9644', '#f1c40f', '#26de81', '#2bcbba', '#9c88ff'];
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
          let res = await new Promise(
            (resolve, reject) => {
              let note = this.getStorage([request.url + key])
              if (note[request.url + key]) {
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
        break
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
  setConfigContainer(model, id, request) {
    model.menu.style.backgroundColor = request.noteColor;
    this.on(model.icon, 'click', () => {
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
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
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
    this.setModeColorFont(model, request.fontColor)
    this.onDelete(model, id);
    this.onAutoSave(model, id, request);
    this.onShowInfo(model, id);
    this.setNoteDOM(model.fusion());
    this.onDrag("#" + model.note.id, "#" + model.area.id);
    this.setPosition(model, request.position);
    this.onConfigTenxSize(model, request, id);
    this.onConfigColor(model, request, id);
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
            height: model.text.clientHeight + 'px'
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
    return {
      area: create('div', 'area'),
      note: create('div', 'note'),
      span: create('span', 'remove'),
      tack: create('div', 'tack'),
      info: create('span', 'message'),
      text: create('textarea', 'paper'),
      icon: create('button', 'config'),
      menu: create('ul', 'menuConfig'),
      save: create('span', 'saveIcon'),
      fusion: function() {
        this.tack.appendChild(this.span);
        this.note.appendChild(this.info);
        this.note.appendChild(this.tack);
        this.note.appendChild(this.save);
        this.note.appendChild(this.text);
        this.note.appendChild(this.icon);
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
  setModeColorFont(model, mode) {
    let type = mode == "white" ? "-light.svg" : '.svg';
    model.icon.style.backgroundImage = "url(" + this.URL('src/img/cog' + type) + ")";
    model.save.style.backgroundImage = "url(" + this.URL('src/img/save' + type) + ")";
    model.text.style.color = mode;
    model.menu.style.color = mode;
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
  onConfigColor(model, request, id) {
    let colors = document.querySelectorAll('#colorsEx' + id + ' div');
    colors.forEach(
      (el, key) => {
        el.style.background = this.palleteActive[key]
        this.on(el, 'click', () => {
          request.noteColor = this.palleteActive[key];
          this.css([model.note, model.menu], {
            background: request.noteColor
          });
          if (key == 0) {
            request.fontColor = 'white';
            this.setModeColorFont(model, request.fontColor);
          }
          else {
            request.fontColor = 'black';
            this.setModeColorFont(model, request.fontColor);
          }
          this.saveTextNote(model, request, id);
        });
      });
  }
}