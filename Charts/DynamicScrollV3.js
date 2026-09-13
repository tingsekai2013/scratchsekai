(function (Scratch) {
  'use strict';


  class ScratchSekaiInfiniteSongList {
    constructor() {
      this.songCount = 3;
      this.poolSize = 11;
      this.spacing = 72;
      this.selectedY = 0;

      this.dragEnabled = true;
      this.dragArea = {
        x1: -240,
        x2: 240,
        y1: -180,
        y2: 180
      };

      this.inertia = 0.90;
      this.snapStrength = 0.28;

      // 100 = normal height. Example: 140 = 40% taller at the center.
      this.selectedYStretch = 140;

      this.dragging = false;
      this.wasMouseDown = false;
      this.lastMouseY = 0;

      this.offsetY = 0;
      this.velocityY = 0;

      this.centerVirtualIndex = 0;
      this.ringShift = 0;

      this.selectionChangedFlag = false;
      this.lastSelectedSong = this._selectedSongNumber();
    }

    getInfo() {
      return {
        id: 'scratchsekaiinfinitesonglist',
        name: 'ScratchSekai Infinite Song List',
        color1: '#35C9C9',
        color2: '#20A7A7',
        color3: '#178686',
        blocks: [
          {
            opcode: 'reset',
            blockType: Scratch.BlockType.COMMAND,
            text: 'reset song selector'
          },
          {
            opcode: 'setSongCount',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set available song count to [COUNT]',
            arguments: {
              COUNT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 60 }
            }
          },
          {
            opcode: 'setPoolSize',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set recycled entry pool size to [COUNT]',
            arguments: {
              COUNT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 11 }
            }
          },
          {
            opcode: 'setSpacing',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set entry spacing to [SPACING]',
            arguments: {
              SPACING: { type: Scratch.ArgumentType.NUMBER, defaultValue: 72 }
            }
          },
          {
            opcode: 'setSelectedY',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set selected entry Y to [Y]',
            arguments: {
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 }
            }
          },
          {
            opcode: 'setSelectedYStretch',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set selected entry Y stretch to [PERCENT] %',
            arguments: {
              PERCENT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 140 }
            }
          },
          {
            opcode: 'setSelectedSong',
            blockType: Scratch.BlockType.COMMAND,
            text: 'jump to song [SONG]',
            arguments: {
              SONG: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },

          '---',

          {
            opcode: 'setDragging',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set vertical dragging [STATE]',
            arguments: {
              STATE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'onOff',
                defaultValue: 'on'
              }
            }
          },
          {
            opcode: 'setDragArea',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set drag area x [X1] to [X2] y [Y1] to [Y2]',
            arguments: {
              X1: { type: Scratch.ArgumentType.NUMBER, defaultValue: -240 },
              X2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 240 },
              Y1: { type: Scratch.ArgumentType.NUMBER, defaultValue: -180 },
              Y2: { type: Scratch.ArgumentType.NUMBER, defaultValue: 180 }
            }
          },
          {
            opcode: 'setInertia',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set inertia to [VALUE]',
            arguments: {
              VALUE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.90 }
            }
          },
          {
            opcode: 'setSnapStrength',
            blockType: Scratch.BlockType.COMMAND,
            text: 'set snap strength to [VALUE]',
            arguments: {
              VALUE: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.28 }
            }
          },
          {
            opcode: 'updateInput',
            blockType: Scratch.BlockType.COMMAND,
            text: 'update input mouse x [X] y [Y] down [DOWN]',
            arguments: {
              X: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              Y: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0 },
              DOWN: { type: Scratch.ArgumentType.BOOLEAN }
            }
          },

          '---',

          {
            opcode: 'slotY',
            blockType: Scratch.BlockType.REPORTER,
            text: 'Y for recycled slot [SLOT]',
            arguments: {
              SLOT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'slotSong',
            blockType: Scratch.BlockType.REPORTER,
            text: 'song number for recycled slot [SLOT]',
            arguments: {
              SLOT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'slotRelativePosition',
            blockType: Scratch.BlockType.REPORTER,
            text: 'relative position for recycled slot [SLOT]',
            arguments: {
              SLOT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'slotVirtualIndex',
            blockType: Scratch.BlockType.REPORTER,
            text: 'virtual index for recycled slot [SLOT]',
            arguments: {
              SLOT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'slotSelected',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'recycled slot [SLOT] selected?',
            arguments: {
              SLOT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },
          {
            opcode: 'slotYStretch',
            blockType: Scratch.BlockType.REPORTER,
            text: 'Y stretch for recycled slot [SLOT]',
            arguments: {
              SLOT: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 }
            }
          },

          '---',

          {
            opcode: 'selectedSong',
            blockType: Scratch.BlockType.REPORTER,
            text: 'selected song number'
          },
          {
            opcode: 'selectionChanged',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'selected song changed?'
          },
          {
            opcode: 'clearSelectionChanged',
            blockType: Scratch.BlockType.COMMAND,
            text: 'clear selected song changed flag'
          },
          {
            opcode: 'isDragging',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'song list dragging?'
          },
          {
            opcode: 'isSettled',
            blockType: Scratch.BlockType.BOOLEAN,
            text: 'song list settled?'
          },
          {
            opcode: 'velocity',
            blockType: Scratch.BlockType.REPORTER,
            text: 'song list velocity'
          },
          {
            opcode: 'offset',
            blockType: Scratch.BlockType.REPORTER,
            text: 'song list offset'
          }
        ],
        menus: {
          onOff: {
            acceptReporters: true,
            items: ['on', 'off']
          }
        }
      };
    }

    _number(value, fallback = 0) {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    }

    _bool(value) {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value !== 0;

      const text = String(value).trim().toLowerCase();
      return !(
        text === '' ||
        text === '0' ||
        text === 'false' ||
        text === 'off' ||
        text === 'no' ||
        text === 'null' ||
        text === 'undefined'
      );
    }

    _mod(value, mod) {
      if (mod <= 0) return 0;
      return ((value % mod) + mod) % mod;
    }

    _normalizePoolSize(value) {
      let n = Math.floor(Math.abs(this._number(value, 11)));
      if (n < 1) n = 1;
      if (n > 101) n = 101;

      if (n % 2 === 0) {
        n += 1;
        if (n > 101) n = 101;
      }

      return n;
    }

    _selectedSongNumber() {
      if (this.songCount <= 0) return 0;
      return this._mod(this.centerVirtualIndex, this.songCount) + 1;
    }

    _rememberSelectionChange(previousSong) {
      const now = this._selectedSongNumber();

      if (now !== previousSong) {
        this.selectionChangedFlag = true;
      }

      this.lastSelectedSong = now;
    }

    _insideDragArea(x, y) {
      const minX = Math.min(this.dragArea.x1, this.dragArea.x2);
      const maxX = Math.max(this.dragArea.x1, this.dragArea.x2);
      const minY = Math.min(this.dragArea.y1, this.dragArea.y2);
      const maxY = Math.max(this.dragArea.y1, this.dragArea.y2);

      return (
        x >= minX &&
        x <= maxX &&
        y >= minY &&
        y <= maxY
      );
    }

    _normalizeOffset() {
      if (this.spacing <= 0) return;

      const previousSong = this._selectedSongNumber();
      const halfSpacing = this.spacing / 2;

      // The closest entry to selectedY becomes selected.
      // Crossing the halfway point means the neighboring entry is now closer.
      if (this.offsetY > halfSpacing) {
        const steps = Math.floor(
          (this.offsetY + halfSpacing) / this.spacing
        );

        this.centerVirtualIndex += steps;
        this.offsetY -= steps * this.spacing;

        this.ringShift = this._mod(
          this.ringShift - steps,
          this.poolSize
        );
      } else if (this.offsetY < -halfSpacing) {
        const steps = Math.floor(
          (-this.offsetY + halfSpacing) / this.spacing
        );

        this.centerVirtualIndex -= steps;
        this.offsetY += steps * this.spacing;

        this.ringShift = this._mod(
          this.ringShift + steps,
          this.poolSize
        );
      }

      this._rememberSelectionChange(previousSong);
    }

    _slotInfo(slotValue) {
      const pool = this.poolSize;
      const half = Math.floor(pool / 2);

      let slot = Math.floor(this._number(slotValue, 1));
      if (slot < 1) slot = 1;
      if (slot > pool) slot = pool;

      const logicalRaw = this._mod(
        (slot - 1) + this.ringShift,
        pool
      );

      const relative = logicalRaw - half;
      const virtualIndex = this.centerVirtualIndex + relative;

      // relative > 0 is visually below the center.
      const y =
        this.selectedY -
        (relative * this.spacing) +
        this.offsetY;

      const songNumber =
        this.songCount > 0
          ? this._mod(virtualIndex, this.songCount) + 1
          : 0;

      const distanceFromCenter = Math.abs(y - this.selectedY);

      /*
       * Smooth vertical stretch:
       * exactly at center = selectedYStretch
       * one full entry-spacing away = 100
       *
       * This means while two entries trade places around the center,
       * the stretch transitions smoothly instead of popping.
       */
      const proximity = Math.max(
        0,
        Math.min(1, 1 - distanceFromCenter / this.spacing)
      );

      // Slight easing makes the center "bulge" feel less linear.
      const easedProximity = proximity * proximity * (3 - 2 * proximity);

      const yStretch =
        100 +
        (this.selectedYStretch - 100) * easedProximity;

      return {
        slot,
        relative,
        virtualIndex,
        y,
        songNumber,
        selected: relative === 0,
        yStretch
      };
    }

    _stepPhysics() {
      if (this.dragging) return;

      const previousSong = this._selectedSongNumber();

      if (Math.abs(this.velocityY) > 0.025) {
        this.offsetY += this.velocityY;
        this.velocityY *= this.inertia;

        if (Math.abs(this.velocityY) < 0.025) {
          this.velocityY = 0;
        }
      } else {
        this.velocityY = 0;

        if (Math.abs(this.offsetY) > 0.025) {
          this.offsetY +=
            (0 - this.offsetY) * this.snapStrength;

          if (Math.abs(this.offsetY) < 0.025) {
            this.offsetY = 0;
          }
        } else {
          this.offsetY = 0;
        }
      }

      this._normalizeOffset();
      this._rememberSelectionChange(previousSong);
    }

    reset() {
      this.dragging = false;
      this.wasMouseDown = false;
      this.lastMouseY = 0;
      this.offsetY = 0;
      this.velocityY = 0;
      this.centerVirtualIndex = 0;
      this.ringShift = 0;
      this.selectionChangedFlag = false;
      this.lastSelectedSong = this._selectedSongNumber();
    }

    setSongCount(args) {
      const previousSong = this._selectedSongNumber();

      this.songCount = Math.max(
        0,
        Math.floor(Math.abs(this._number(args.COUNT, 0)))
      );

      this._rememberSelectionChange(previousSong);
    }

    setPoolSize(args) {
      this.poolSize = this._normalizePoolSize(args.COUNT);
      this.ringShift = 0;
    }

    setSpacing(args) {
      const value = Math.abs(this._number(args.SPACING, this.spacing));

      if (value > 0.0001) {
        this.spacing = value;
        this._normalizeOffset();
      }
    }

    setSelectedY(args) {
      this.selectedY = this._number(args.Y, this.selectedY);
    }

    setSelectedYStretch(args) {
      const value = this._number(args.PERCENT, 140);
      this.selectedYStretch = Math.max(1, Math.min(500, value));
    }

    setSelectedSong(args) {
      if (this.songCount <= 0) return;

      const previousSong = this._selectedSongNumber();

      let song = Math.floor(this._number(args.SONG, 1));
      song = this._mod(song - 1, this.songCount);

      this.centerVirtualIndex = song;
      this.offsetY = 0;
      this.velocityY = 0;
      this.ringShift = 0;

      this._rememberSelectionChange(previousSong);
    }

    setDragging(args) {
      this.dragEnabled =
        String(args.STATE).trim().toLowerCase() === 'on';

      if (!this.dragEnabled) {
        this.dragging = false;
        this.wasMouseDown = false;
      }
    }

    setDragArea(args) {
      this.dragArea.x1 = this._number(args.X1, -240);
      this.dragArea.x2 = this._number(args.X2, 240);
      this.dragArea.y1 = this._number(args.Y1, -180);
      this.dragArea.y2 = this._number(args.Y2, 180);
    }

    setInertia(args) {
      const value = this._number(args.VALUE, this.inertia);
      this.inertia = Math.max(0, Math.min(0.9999, value));
    }

    setSnapStrength(args) {
      const value = this._number(args.VALUE, this.snapStrength);
      this.snapStrength = Math.max(0.001, Math.min(1, value));
    }

    updateInput(args) {
      const x = this._number(args.X, 0);
      const y = this._number(args.Y, 0);
      const down = this._bool(args.DOWN);

      if (down && !this.wasMouseDown) {
        if (
          this.dragEnabled &&
          this._insideDragArea(x, y)
        ) {
          this.dragging = true;
          this.lastMouseY = y;
          this.velocityY = 0;
        }
      }

      if (down && this.dragging && this.wasMouseDown) {
        const previousSong = this._selectedSongNumber();

        const deltaY = y - this.lastMouseY;
        this.lastMouseY = y;

        this.offsetY += deltaY;
        this.velocityY = deltaY;

        this._normalizeOffset();
        this._rememberSelectionChange(previousSong);
      }

      if (!down && this.wasMouseDown) {
        this.dragging = false;
      }

      this.wasMouseDown = down;

      if (!this.dragging) {
        this._stepPhysics();
      }
    }

    slotY(args) {
      return this._slotInfo(args.SLOT).y;
    }

    slotSong(args) {
      return this._slotInfo(args.SLOT).songNumber;
    }

    slotRelativePosition(args) {
      return this._slotInfo(args.SLOT).relative;
    }

    slotVirtualIndex(args) {
      return this._slotInfo(args.SLOT).virtualIndex;
    }

    slotSelected(args) {
      return this._slotInfo(args.SLOT).selected;
    }

    slotYStretch(args) {
      return this._slotInfo(args.SLOT).yStretch;
    }

    selectedSong() {
      return this._selectedSongNumber();
    }

    selectionChanged() {
      return this.selectionChangedFlag;
    }

    clearSelectionChanged() {
      this.selectionChangedFlag = false;
    }

    isDragging() {
      return this.dragging;
    }

    isSettled() {
      return (
        !this.dragging &&
        Math.abs(this.velocityY) <= 0.025 &&
        Math.abs(this.offsetY) <= 0.025
      );
    }

    velocity() {
      return this.velocityY;
    }

    offset() {
      return this.offsetY;
    }
  }

  Scratch.extensions.register(
    new ScratchSekaiInfiniteSongList()
  );
})(Scratch);
