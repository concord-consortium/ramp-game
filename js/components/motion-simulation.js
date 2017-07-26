import React, { PureComponent } from 'react'
import Matter from 'matter-js'

 var Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Composites = Matter.Composites,
        Common = Matter.Common,
        MouseConstraint = Matter.MouseConstraint,
        Mouse = Matter.Mouse,
        World = Matter.World,
        Vertices = Matter.Vertices,
		    Body = Matter.Body,
        Vector = Matter.Vector,
        Events = Matter.Events,
        Bodies = Matter.Bodies;


export default class MotionJSSimulation extends PureComponent {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    this.physicsInit()
  }
  physicsInit() {
    const rotationAngle = -Math.PI / 3.5,
    worldWidth = 800,
    worldHeight = 600,
    groundHeight = 40

    // bodies are positioned via their center of mass. This is easy to calculate for a rectangle.
    const ground = Bodies.rectangle(
      worldWidth/2 ,worldHeight - (groundHeight/2), worldWidth, groundHeight,
      {
        isStatic: true,
        id: "ground",
        restitution: 0,
        render: {
          opacity: 1,
          lineWidth: 0,
          fillStyle: 'darkgreen'
        }
      }
    )

    const leftWallPivot = Bodies.circle(
      200, 500, 5, {
        isStatic: true
      }
    )

    const leftWall = Bodies.rectangle(
     0,0, 20, 1000,
      {
        isStatic: true,
        restitution: 0,
        id: "wall"
      }
    )
    Body.rotate(leftWall, rotationAngle)
    Body.translate(leftWall, { x: 200, y: 500 })

    const carTest = Bodies.rectangle(
      100, 330, 40, 20, {
        mass: 1,
        frictionAir: 0.01,
        frictionStatic: 0.9,
        friction: 0.02,
        sleepThreshold: 5,
        restitution: 0,
        slop:0,
        label: "car",
        render: {
          sprite: {
            texture: 'fastcar.png',
            xScale: 0.25,
            yScale: 0.25,
            yOffset: 0.1
          }
        }
      }
    )

    Body.rotate(carTest, -rotationAngle)

    let engine = Engine.create(),
    world = engine.world

		engine.world.gravity.x = 0;
    engine.world.gravity.y = 2;

    // create renderer
    let render = Render.create({
        element: this.refs.canvas,
        engine: engine,
        options: {
            width: worldWidth,
            height: worldHeight,
            showVelocity: true,
            wireframes: false
        }
    });

    Render.run(render);

    // create runner
    let runner = Runner.create();
    Runner.run(runner, engine);

    World.add(world, [ground, leftWall, leftWallPivot, carTest])


    // add mouse control
    let mouse = Mouse.create(render.canvas),
        mouseConstraint = MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 1,
                render: {
                    visible: false
                }
            }
        });

    World.add(world, mouseConstraint);
    Events.on(carTest, "sleepStart", function (e) {
      console.log("sleepStart")
    })
    Events.on(carTest, "sleepEnd", function (e) {
      console.log("sleepEnd")
    })
    Events.on(engine, "afterUpdate", function (e) {
      //console.log(e.source);
      //console.log(circleTest)
      //console.log(carTest.angularSpeed)
      //console.log(carTest.velocity.x && carTest.position.x > 200)
      if (carTest.velocity.x < 0.01 && carTest.position.x > 200) {
        carTest.position = { x: Math.round(carTest.position.x), y: Math.round(carTest.position.y) }
        //console.log(carTest.position, 3)
      }
    })
  }

  tickData(e) {
    //console.log(e.position)
  }

  render() {
    return (
      <div>
        <div ref="canvas"></div>
      </div>
    )
  }
}