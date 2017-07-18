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
        Bodies = Matter.Bodies;


export default class SimulationBase extends PureComponent {
  constructor(props) {
    super(props)
  }
  componentDidMount() {
    this.physicsInit()
  }
  physicsInit(){
    const ground = Bodies.rectangle(
      0, 500, 2000, 40,
      {
        isStatic: true,
        id: "ground"
      }
    )

    const leftWall = Bodies.rectangle(
     0,0, 20, 1000,
      {
        isStatic: true,
        id: "wall"
      }
    )
    Body.rotate(leftWall, -Math.PI/4)
    Body.translate(leftWall, { x: 200, y: 500 })


    const leftWallPivot = Bodies.circle(
      200, 500, 5, {
        isStatic: true
      }
    )

    const circleTest = Bodies.circle(
      200, 200, 20, {
        mass: 1,
        frictionAir: 0.01,
        frictionStatic: 0.9,
        friction: 0.5
      }
    )

    let engine = Engine.create(),
    world = engine.world

		engine.world.gravity.x = 0;
    engine.world.gravity.y = 2;

    // create renderer
    let render = Render.create({
        element: this.refs.canvas,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            showVelocity: true
        }
    });

    Render.run(render);

    // create runner
    let runner = Runner.create();
    Runner.run(runner, engine);

    World.add(world, [ground, leftWall, leftWallPivot, circleTest])


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
  }

  render() {
    return (
      <div>
        <div ref="canvas"></div>
      </div>
    )
  }
}