(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error('This extension must run unsandboxed');
  }

  const vm = Scratch.vm;

  class TimedEvents {
    constructor() {
      this.events = [];
      this.startTime = null;
      this.running = false;
    }

    getInfo() {
      return {
        id: 'timedevents',
        name: 'Timed Events',
        blocks: [
          {
            opcode: 'startClock',
            blockType: Scratch.BlockType.COMMAND,
            text: 'start music clock'
          },
          {
            opcode: 'addEvent',
            blockType: Scratch.BlockType.COMMAND,
            text: 'at [TIME] seconds do [EVENT]',
            arguments: {
              TIME: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
              EVENT: { type: Scratch.ArgumentType.STRING, defaultValue: 'event1' }
            }
          },
          {
            opcode: 'update',
            blockType: Scratch.BlockType.HAT,
            text: 'tick'
          }
        ]
      };
    }

    startClock() {
      this.events = [];
      this.startTime = performance.now();
      this.running = true;

      const loop = () => {
        if (!this.running) return;

        const now = (performance.now() - this.startTime) / 1000;

        for (const e of this.events) {
          if (!e.triggered && now >= e.time) {
            e.triggered = true;

            // trigger Scratch broadcast
            vm.runtime.startHats(e.event);
          }
        }

        requestAnimationFrame(loop);
      };

      loop();
    }

    addEvent(args) {
      this.events.push({
        time: Number(args.TIME),
        event: args.EVENT,
        triggered: false
      });
    }

    update() {
      // optional hook if you want Scratch-driven ticking
    }
  }

  Scratch.extensions.register(new TimedEvents());

})(Scratch);
