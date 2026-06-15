(function(Scratch) {
    'use strict';

    if (!Scratch || !Scratch.extensions) {
        return;
    }

    let startTime = Date.now();
    // A set to remember which timestamps have already fired during this run
    let firedTimestamps = new Set(); 

    class DynamicRhythmTimer {
        getInfo() {
            return {
                id: 'dynamicrhythmtimer',
                name: 'Rhythm Timer',
                color1: '#2DA44E', // A fresh green color for your rhythm blocks
                blocks: [
                    {
                        opcode: 'getMusicTimer',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'music timer'
                    },
                    {
                        opcode: 'resetMusicTimer',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'reset music timer'
                    },
                    {
                        opcode: 'whenMusicTimerHits',
                        blockType: Scratch.BlockType.HAT,
                        text: 'when music timer hits [SECONDS]s',
                        isEdgeActivated: true,
                        arguments: {
                            SECONDS: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 4.5
                            }
                        }
                    }
                ]
            };
        }

        getMusicTimer() {
            return (Date.now() - startTime) / 1000;
        }

        resetMusicTimer() {
            startTime = Date.now();
            firedTimestamps.clear(); // Clears all spent notes so the song can restart perfectly
        }

        whenMusicTimerHits(args) {
            const targetTime = Number(args.SECONDS);
            const currentTime = this.getMusicTimer();

            // If this specific timestamp hasn't fired yet, and the timer has reached/passed it
            if (!firedTimestamps.has(targetTime) && currentTime >= targetTime) {
                firedTimestamps.add(targetTime); // Lock this timestamp so it never fires again this run
                return true; // Fire the Hat block!
            }
            return false;
        }
    }

    Scratch.extensions.register(new DynamicRhythmTimer());
})(Scratch);
