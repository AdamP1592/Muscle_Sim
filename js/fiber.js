
const fiber_const_map = {
    a: 65.06,
    b: 1.019,
    c: 7.011,
    d: 6.89, 
    tau_c: 3.7, 
    t_p: 3.0,
    tau_r: 3.9, 
    alpha: 2,
    length: 35,
    tau_b: -5.085

};
class fiber{
    constructor(constants = fiber_const_map){
        this.a = constants["a"];
        this.b = constants["b"];
        this.c = constants["c"];
        this.d = constants["d"];
        this.tau_c = constants["tau_c"];
        this.t_p = constants["t_p"];
        this.t_b = this.t_p;// approximate form
        this.tau_r = constants["tau_r"];
        this.alpha = constants["alpha"];
        this.length = constants["length"];

        this.stimulusDuration = 0.0
        
    }
    contract(dt, activeStimulation = true){
        // update duration for stim
        this.stimulusDuration += dt;
        
        // clear duration when the stimulation stops
        if(!activeStimulation){
            this.stimulusDuration = 0;
        }
        let t = this.stimulusDuration;

        // Debug Info
        console.log(`Constants:\n a:${this.a}, b:${this.b}, c:${this.c}, d:${this.d}\n tau_c:${this.tau_c}, tau_r:${this.tau_r}\n t_p:${this.t_p} t_b:${this.t_b}\n alpha:${this.alpha}`)
        
        let trClamped = Math.max(t - this.t_b, 0) / this.tau_r;
        
        // Debug Info
        console.log(`clamped TR: ${trClamped}, t: ${t}, t_b: ${this.t_b}, tau_r: ${this.tau_r}`)

        let f_t_Numerator = (1 - Math.E ** ( - ((t / this.tau_c) ** this.alpha) )) * Math.E ** (- (trClamped ** this.alpha));
        let f_t_Denominator = (1 - Math.E ** ( - ((this.t_p / this.tau_c) ** this.alpha) )) * Math.E ** ( - (((this.t_p - this.t_b) / this.tau_r) ** this.alpha) );

        let f_t = f_t_Numerator / f_t_Denominator

        let f_passive = this.a * ((this.length - this.b) ** 2);
        let f_active = (this.c * this.length) - this.d;

        
        let force = (f_passive * (this.length < this.b)) + (f_active * f_t) * activeStimulation;
        // Debug Info
        console.log(`force: ${force}, f_passive ${f_passive}, f_active ${f_active}, f_t ${f_t}, f_t_numerator ${f_t_Numerator}, f_t_denom${f_t_Denominator}`)
        return force
    }

}


//var fiber1 = fiber(fiber_const_map);