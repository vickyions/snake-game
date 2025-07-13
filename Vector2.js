export default class Vector2 extends Array {
  constructor(x = 0, y = 0) {
    super(2);
    this[0] = x;
    this[1] = y;
  }

  get x() {
    return this[0];
  }

  set x(value) {
    this[0] = value;
  }

  get y() {
    return this[1];
  }

  set y(value) {
    this[1] = value;
  }

  get magnitude() {
    return Math.hypot(this.x, this.y);
  }

  add(v) {
    if (Object.getPrototypeOf(v) !== Vector2.prototype) throw new TypeError("Argument must be a direct instance of Vector2");
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  subtract(v) {
    if (Object.getPrototypeOf(v) !== Vector2.prototype) throw new TypeError("Argument must be a direct instance of Vector2");
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  multiply(scalar) {
    if (typeof scalar !== 'number' || !Number.isFinite(scalar)) throw new TypeError("Argument must be a finite Number");
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  divide(scalar) {
    if (typeof scalar !== 'number' || !Number.isFinite(scalar)) throw new TypeError("Argument must be a finite Number");
    if (scalar === 0) throw new TypeError("Can't divide by zero");
    return new Vector2(this.x / scalar, this.y / scalar);
  }

  dot(v) {
    if (Object.getPrototypeOf(v) !== Vector2.prototype) throw new TypeError("Argument must be a direct instance of Vector2");
    return this.x * v.x + this.y + v.y;
  }


  normalize() {
    if (this.magnitude === 0) return new Vector2(0, 0);
    else return this.divide(this.magnitude);
  }


  angle(v) {
    if (Object.getPrototypeOf(v) !== Vector2.prototype) throw new TypeError("Argument must be a direct instance of Vector2");
    if (this.magnitude === 0 || v.magnitude === 0) throw new TypeError("");
    return Math.acos(this.dot(v) / (this.magnitude * v.magnitude));
  }

  isEqual(v) {
    if (Object.getPrototypeOf(v) !== Vector2.prototype) throw new TypeError("Argument must be a direct instance of Vector2");
    return this.x === v.x && this.y === v.y;

  }

  toString() {
    return `Vector2(${this.x}, ${this.y})`;
  }
}

