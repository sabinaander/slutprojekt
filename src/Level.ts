interface ILevel {
    generateNextLevel(): void;
}

class Level implements ILevel {
    public spaceObjects: Array<Asteroid | Bomb> = [];
    public timeBaseValue: number;
    public levelValue: number;
    public score: number;
    private levelGoal: number;
    public amountOfLivesLeft: number;
    private prepareForNextLevel: boolean;
    private levelMenu: LevelMenu;
    public levelMenuContainer!: HTMLDivElement;
    private amountOfBombs: number;


    constructor() {
        this.timeBaseValue = 50;
        this.levelValue = 0;
        this.levelGoal = 0;
        this.amountOfLivesLeft = 3;
        this.score = 0;
        this.amountOfBombs = 1;
        this.generateNextLevel();
        this.levelMenu = new LevelMenu(this);
        this.prepareForNextLevel = false;
    }

    // gets the current level value (number) 
    public getCurrentLevel() {
        return this.levelValue;
    }

    // gets the time the player have to pass a level
    public getTimeBaseValue() {
        return this.timeBaseValue;
    }

    // calculates how long a player has to pass a level
    public calculateCountdownTimer() {
        //defining the value of timebasevalue depending on which level    
        this.timeBaseValue = this.timeBaseValue * (1 + (this.levelValue * 0.2));
        return this.timeBaseValue;
    }

    // the countdown-timer, use value from timebasevalue, calculateCountdownTimer()
    // both deducts 1 second every 60ms and checks if a player has passed a level.

    private levelCountDownTimer() {

        // loops to countdown the timebasevalue
        if (frameCount % 60 === 0 && this.timeBaseValue > 0) {
            this.timeBaseValue--;
        }

        // when the level-timer (timeBaseValue) reach 0, this happens

        // Time reach 0, player did not make the score, game over
        if (this.timeBaseValue === 0) {
            this.prepareForNextLevel = true;
            this.levelMenu.timeIsOutMenu(this.score, this.levelGoal, this.amountOfLivesLeft);

            sound[8].setVolume(.1);
            sound[8].play()
            sound[9].play(4, undefined, .2);
        }

        // Player has reached the goal, pass level and generate next level
        //we need to set state to game over before playing game over sound, otherwise it will play it 60/ a second forever
        //you didn't pass score in time, earth is no more.
        
         if(this.score >= this.levelGoal){

             // NEXT LEVEL SHOW
            this.prepareForNextLevel = true;
            this.levelMenu.openLevelMenu(this.score, this.levelGoal, this.amountOfLivesLeft);
            sound[6].play();
            sound[6].setVolume(.3);
            sound[7].play(3.5, undefined, undefined, undefined,1.7);
            sound[7].setVolume(.5);
         }

        // Player runs out of lives (has hit bombs too many times), did not pass the level, game over
        if (this.amountOfLivesLeft == 0) {
            this.prepareForNextLevel = true;
            this.levelMenu.livesIsOutMenu(this.score, this.levelGoal, this.amountOfLivesLeft);
             //we need to set state to game over before playing game over sound, otherwise it will play it 60/ a second forever
             sound[8].setVolume(.1);
             sound[8].play()
             sound[9].play(4, undefined, .2);
        }
    }
    
    // gets the current level goal (number) 
    // returns levelgoal
    public getLevelGoal() {
        return this.levelGoal;
    }

    // gets the current amounts of lives a player has left (number) 
    // returns returns amountoflivesleft
    public getAmountOfLivesLeft() {
        return this.amountOfLivesLeft;
    }

    // Add more lives after xxxxxx amount of levels.
    // returns amountoflivesleft
    public calculateAmountOfLivesLeft() {
        const isDividableBy5 = !(this.levelValue % 5)
        if (isDividableBy5 && this.amountOfLivesLeft < 3) {
            this.amountOfLivesLeft++;
        }
    }

    // Sets the goal a player needs to reach.  
    // the calc = the current amount of spaceobjects times 5 (to be sure a player can possibly win the level every time)
    // returns levelgoal
    public setNewGoal(nrOfAsteroids: number) {
        this.levelGoal = nrOfAsteroids * 5;
    }

    // generates all space objects  (Bombs and asteroids)
    private generateSpaceObjects() {
        // start value of asteroids is 5, adds the value of level (example: level 6 would be 5+6).
        let amountOfAsteroids = 5 + this.levelValue;

        // start value of bombs is 1, and will add more depending on which level

        const isDividableBy3 = !(this.levelValue % 3)
        if (isDividableBy3) {
            this.amountOfBombs = this.amountOfBombs + 1;
        }

        // defining the total amout of objects (asteroids + bombs)
        let amountOfObjects = amountOfAsteroids + this.amountOfBombs;

        // clear the array before adding new objects
        this.spaceObjects.splice(0, amountOfObjects);

        // adds asteroids, randomized size and position on the vector.
        while (this.spaceObjects.length < amountOfAsteroids) {
            let position = createVector(random(100, (width - 100)), random(100, (height - 300)));
            let size = random(25, 100);
            let healthLevel = 1;
            let score = 5;
            let angle = random(1, 300);

            // adds the health of an asteroid depending on size
            if (size > 75) {
                healthLevel = 3
            } else if (size < 75 && size > 50) {
                healthLevel = 2
            }

            // adds the score a player can get from shooting down an asteroid, depends on healthlevel
            score = score * healthLevel;


            let asteroid = new Asteroid(position, size, healthLevel, score, angle)

            // makes sure they're not overlappning with other objects
            let overlapping = false;

            for (let j = 0; j < this.spaceObjects.length; j++) {
                let other = this.spaceObjects[j];
                let d = dist(asteroid.position.x, asteroid.position.y,
                     other.position.x, other.position.y);

                if (d < asteroid.size + other.size) {
                    //then they are overlapping
                    overlapping = true;
                }
            }
            // adds asteroid to array if they're not overlapping
            if (!overlapping) {
                this.spaceObjects.push(asteroid);
            }
        }

        // Bomb generator, randomized position on the vector
        while (this.spaceObjects.length < amountOfObjects) {
            let position = createVector(random(100, (width - 100)), random(100, (height - height / 4)));
            let angle = random(1, 300);

            let bomb = new Bomb(position, angle)

            // makes sure they're not overlappning with other objects
            let overlapping = false;

            for (let j = 0; j < this.spaceObjects.length; j++) {
                let other = this.spaceObjects[j];
                let d = dist(bomb.position.x, bomb.position.y, other.position.x, other.position.y);

                if (d < bomb.size + other.size) {
                    //then they are overlapping
                    overlapping = true;
                }
            }
            // adds bomb to array if they're not overlapping
            if (!overlapping) {
                this.spaceObjects.push(bomb);
            }
        }
        return amountOfAsteroids;
    }

    // Replaces all values when generating a new level, and calls functions to calculate the new values
    public generateNextLevel() {
        this.prepareForNextLevel = false;
        this.timeBaseValue = 50;
        this.levelValue = this.levelValue + 1;
        this.score = 0;
        let nrOfAsteroids = this.generateSpaceObjects();
        this.setNewGoal(nrOfAsteroids);
        this.calculateCountdownTimer();
        this.calculateAmountOfLivesLeft()
    }

    public update() {
        if (this.prepareForNextLevel) return;

        for (let object of this.spaceObjects) {
            object.update();
         }

        this.levelCountDownTimer();
    }

    public draw() {
        for (let object of this.spaceObjects) {
            object.draw();
        }
    }
}

