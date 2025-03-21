var nt = Object.defineProperty;
var to = (r) => {
  throw TypeError(r);
};
var lt = (r, o, t) => o in r ? nt(r, o, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[o] = t;
var w = (r, o, t) => lt(r, typeof o != "symbol" ? o + "" : o, t), ao = (r, o, t) => o.has(r) || to("Cannot " + t);
var x = (r, o, t) => (ao(r, o, "read from private field"), t ? t.call(r) : o.get(r)), kr = (r, o, t) => o.has(r) ? to("Cannot add the same private member more than once") : o instanceof WeakSet ? o.add(r) : o.set(r, t), Lr = (r, o, t, a) => (ao(r, o, "write to private field"), a ? a.call(r, t) : o.set(r, t), t);
import { AgentMessenger as st, AgentConnection as it } from "@cleverflow/cleverflow.core";
const dt = "5";
var go;
typeof window < "u" && ((go = window.__svelte ?? (window.__svelte = {})).v ?? (go.v = /* @__PURE__ */ new Set())).add(dt);
const ht = "[", ut = "]", er = {}, E = Symbol(), ft = "http://www.w3.org/1999/xhtml", vt = "http://www.w3.org/2000/svg", co = !1, M = 2, po = 4, Mr = 8, Jr = 16, q = 32, Z = 64, Er = 128, j = 256, Cr = 512, S = 1024, Y = 2048, ir = 4096, lr = 8192, Or = 16384, gt = 32768, Zr = 65536, pt = 1 << 19, yo = 1 << 20, Ur = Symbol("$state"), yt = Symbol("legacy props"), kt = Symbol("");
var ko = Array.isArray, wt = Array.prototype.indexOf, mt = Array.from, Sr = Object.keys, Ar = Object.defineProperty, nr = Object.getOwnPropertyDescriptor, bt = Object.getOwnPropertyDescriptors, xt = Object.prototype, _t = Array.prototype, wo = Object.getPrototypeOf;
const qr = () => {
};
function mo(r) {
  for (var o = 0; o < r.length; o++)
    r[o]();
}
const $t = typeof requestIdleCallback > "u" ? (r) => setTimeout(r, 1) : requestIdleCallback;
let Gr = [], ur = [];
function zt() {
  var r = Gr;
  Gr = [], mo(r);
}
function bo() {
  var r = ur;
  ur = [], mo(r);
}
function Et(r) {
  ur.length === 0 && $t(bo), ur.push(r);
}
function eo() {
  Gr.length > 0 && zt(), ur.length > 0 && bo();
}
function xo(r) {
  return r === this.v;
}
function _o(r, o) {
  return r != r ? o == o : r !== o || r !== null && typeof r == "object" || typeof r == "function";
}
function Ct(r) {
  return !_o(r, this.v);
}
function St(r) {
  throw new Error("https://svelte.dev/e/effect_in_teardown");
}
function At() {
  throw new Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function Nt(r) {
  throw new Error("https://svelte.dev/e/effect_orphan");
}
function Tt() {
  throw new Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function jt() {
  throw new Error("https://svelte.dev/e/hydration_failed");
}
function Rt() {
  throw new Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Mt() {
  throw new Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ot() {
  throw new Error("https://svelte.dev/e/state_unsafe_local_read");
}
function Pt() {
  throw new Error("https://svelte.dev/e/state_unsafe_mutation");
}
let Ft = !1;
const fr = /* @__PURE__ */ new Map();
function P(r, o) {
  var t = {
    f: 0,
    // TODO ideally we could skip this altogether, but it causes type errors
    v: r,
    reactions: null,
    equals: xo,
    rv: 0,
    wv: 0
  };
  return t;
}
function $o(r) {
  return /* @__PURE__ */ It(P(r));
}
// @__NO_SIDE_EFFECTS__
function zo(r, o = !1) {
  const t = P(r);
  return o || (t.equals = Ct), t;
}
// @__NO_SIDE_EFFECTS__
function It(r) {
  return g !== null && !R && (g.f & M) !== 0 && (F === null ? Yt([r]) : F.push(r)), r;
}
function T(r, o) {
  return g !== null && !R && Ko() && (g.f & (M | Jr)) !== 0 && // If the source was created locally within the current derived, then
  // we allow the mutation.
  (F === null || !F.includes(r)) && Pt(), Dt(r, o);
}
function Dt(r, o) {
  if (!r.equals(o)) {
    var t = r.v;
    pr ? fr.set(r, o) : fr.set(r, t), r.v = o, r.wv = Mo(), Eo(r, Y), p !== null && (p.f & S) !== 0 && (p.f & (q | Z)) === 0 && (A === null ? Bt([r]) : A.push(r));
  }
  return o;
}
function Eo(r, o) {
  var t = r.reactions;
  if (t !== null)
    for (var a = t.length, c = 0; c < a; c++) {
      var e = t[c], n = e.f;
      (n & Y) === 0 && (I(e, o), (n & (S | j)) !== 0 && ((n & M) !== 0 ? Eo(
        /** @type {Derived} */
        e,
        ir
      ) : Ir(
        /** @type {Effect} */
        e
      )));
    }
}
// @__NO_SIDE_EFFECTS__
function Co(r) {
  var o = M | Y, t = g !== null && (g.f & M) !== 0 ? (
    /** @type {Derived} */
    g
  ) : null;
  return p === null || t !== null && (t.f & j) !== 0 ? o |= j : p.f |= yo, {
    ctx: $,
    deps: null,
    effects: null,
    equals: xo,
    f: o,
    fn: r,
    reactions: null,
    rv: 0,
    v: (
      /** @type {V} */
      null
    ),
    wv: 0,
    parent: t ?? p
  };
}
function So(r) {
  var o = r.effects;
  if (o !== null) {
    r.effects = null;
    for (var t = 0; t < o.length; t += 1)
      D(
        /** @type {Effect} */
        o[t]
      );
  }
}
function Lt(r) {
  for (var o = r.parent; o !== null; ) {
    if ((o.f & M) === 0)
      return (
        /** @type {Effect} */
        o
      );
    o = o.parent;
  }
  return null;
}
function Ut(r) {
  var o, t = p;
  W(Lt(r));
  try {
    So(r), o = Po(r);
  } finally {
    W(t);
  }
  return o;
}
function Ao(r) {
  var o = Ut(r), t = (H || (r.f & j) !== 0) && r.deps !== null ? ir : S;
  I(r, t), r.equals(o) || (r.v = o, r.wv = Mo());
}
function Pr(r) {
  console.warn("https://svelte.dev/e/hydration_mismatch");
}
let y = !1;
function cr(r) {
  y = r;
}
let k;
function U(r) {
  if (r === null)
    throw Pr(), er;
  return k = r;
}
function sr() {
  return U(
    /** @type {TemplateNode} */
    /* @__PURE__ */ Q(k)
  );
}
function wr(r) {
  if (y) {
    if (/* @__PURE__ */ Q(k) !== null)
      throw Pr(), er;
    k = r;
  }
}
function ar(r, o = null, t) {
  if (typeof r != "object" || r === null || Ur in r)
    return r;
  const a = wo(r);
  if (a !== xt && a !== _t)
    return r;
  var c = /* @__PURE__ */ new Map(), e = ko(r), n = P(0);
  e && c.set("length", P(
    /** @type {any[]} */
    r.length
  ));
  var s;
  return new Proxy(
    /** @type {any} */
    r,
    {
      defineProperty(i, l, u) {
        (!("value" in u) || u.configurable === !1 || u.enumerable === !1 || u.writable === !1) && Rt();
        var h = c.get(l);
        return h === void 0 ? (h = P(u.value), c.set(l, h)) : T(h, ar(u.value, s)), !0;
      },
      deleteProperty(i, l) {
        var u = c.get(l);
        if (u === void 0)
          l in i && c.set(l, P(E));
        else {
          if (e && typeof l == "string") {
            var h = (
              /** @type {Source<number>} */
              c.get("length")
            ), d = Number(l);
            Number.isInteger(d) && d < h.v && T(h, d);
          }
          T(u, E), no(n);
        }
        return !0;
      },
      get(i, l, u) {
        var v;
        if (l === Ur)
          return r;
        var h = c.get(l), d = l in i;
        if (h === void 0 && (!d || (v = nr(i, l)) != null && v.writable) && (h = P(ar(d ? i[l] : E, s)), c.set(l, h)), h !== void 0) {
          var f = z(h);
          return f === E ? void 0 : f;
        }
        return Reflect.get(i, l, u);
      },
      getOwnPropertyDescriptor(i, l) {
        var u = Reflect.getOwnPropertyDescriptor(i, l);
        if (u && "value" in u) {
          var h = c.get(l);
          h && (u.value = z(h));
        } else if (u === void 0) {
          var d = c.get(l), f = d == null ? void 0 : d.v;
          if (d !== void 0 && f !== E)
            return {
              enumerable: !0,
              configurable: !0,
              value: f,
              writable: !0
            };
        }
        return u;
      },
      has(i, l) {
        var f;
        if (l === Ur)
          return !0;
        var u = c.get(l), h = u !== void 0 && u.v !== E || Reflect.has(i, l);
        if (u !== void 0 || p !== null && (!h || (f = nr(i, l)) != null && f.writable)) {
          u === void 0 && (u = P(h ? ar(i[l], s) : E), c.set(l, u));
          var d = z(u);
          if (d === E)
            return !1;
        }
        return h;
      },
      set(i, l, u, h) {
        var O;
        var d = c.get(l), f = l in i;
        if (e && l === "length")
          for (var v = u; v < /** @type {Source<number>} */
          d.v; v += 1) {
            var m = c.get(v + "");
            m !== void 0 ? T(m, E) : v in i && (m = P(E), c.set(v + "", m));
          }
        d === void 0 ? (!f || (O = nr(i, l)) != null && O.writable) && (d = P(void 0), T(d, ar(u, s)), c.set(l, d)) : (f = d.v !== E, T(d, ar(u, s)));
        var B = Reflect.getOwnPropertyDescriptor(i, l);
        if (B != null && B.set && B.set.call(h, u), !f) {
          if (e && typeof l == "string") {
            var b = (
              /** @type {Source<number>} */
              c.get("length")
            ), G = Number(l);
            Number.isInteger(G) && G >= b.v && T(b, G + 1);
          }
          no(n);
        }
        return !0;
      },
      ownKeys(i) {
        z(n);
        var l = Reflect.ownKeys(i).filter((d) => {
          var f = c.get(d);
          return f === void 0 || f.v !== E;
        });
        for (var [u, h] of c)
          h.v !== E && !(u in i) && l.push(u);
        return l;
      },
      setPrototypeOf() {
        Mt();
      }
    }
  );
}
function no(r, o = 1) {
  T(r, r.v + o);
}
var lo, No, To, jo;
function Hr() {
  if (lo === void 0) {
    lo = window, No = /Firefox/.test(navigator.userAgent);
    var r = Element.prototype, o = Node.prototype;
    To = nr(o, "firstChild").get, jo = nr(o, "nextSibling").get, r.__click = void 0, r.__className = void 0, r.__attributes = null, r.__style = void 0, r.__e = void 0, Text.prototype.__t = void 0;
  }
}
function gr(r = "") {
  return document.createTextNode(r);
}
// @__NO_SIDE_EFFECTS__
function J(r) {
  return To.call(r);
}
// @__NO_SIDE_EFFECTS__
function Q(r) {
  return jo.call(r);
}
function mr(r, o) {
  if (!y)
    return /* @__PURE__ */ J(r);
  var t = (
    /** @type {TemplateNode} */
    /* @__PURE__ */ J(k)
  );
  return t === null && (t = k.appendChild(gr())), U(t), t;
}
function so(r, o) {
  if (!y) {
    var t = (
      /** @type {DocumentFragment} */
      /* @__PURE__ */ J(
        /** @type {Node} */
        r
      )
    );
    return t instanceof Comment && t.data === "" ? /* @__PURE__ */ Q(t) : t;
  }
  return k;
}
function br(r, o = 1, t = !1) {
  let a = y ? k : r;
  for (var c; o--; )
    c = a, a = /** @type {TemplateNode} */
    /* @__PURE__ */ Q(a);
  if (!y)
    return a;
  var e = a == null ? void 0 : a.nodeType;
  if (t && e !== 3) {
    var n = gr();
    return a === null ? c == null || c.after(n) : a.before(n), U(n), n;
  }
  return U(a), /** @type {TemplateNode} */
  a;
}
function qt(r) {
  r.textContent = "";
}
let $r = !1, Nr = !1, Tr = null, X = !1, pr = !1;
function io(r) {
  pr = r;
}
let hr = [];
let g = null, R = !1;
function V(r) {
  g = r;
}
let p = null;
function W(r) {
  p = r;
}
let F = null;
function Yt(r) {
  F = r;
}
let _ = null, C = 0, A = null;
function Bt(r) {
  A = r;
}
let Ro = 1, jr = 0, H = !1;
function Mo() {
  return ++Ro;
}
function yr(r) {
  var h;
  var o = r.f;
  if ((o & Y) !== 0)
    return !0;
  if ((o & ir) !== 0) {
    var t = r.deps, a = (o & j) !== 0;
    if (t !== null) {
      var c, e, n = (o & Cr) !== 0, s = a && p !== null && !H, i = t.length;
      if (n || s) {
        var l = (
          /** @type {Derived} */
          r
        ), u = l.parent;
        for (c = 0; c < i; c++)
          e = t[c], (n || !((h = e == null ? void 0 : e.reactions) != null && h.includes(l))) && (e.reactions ?? (e.reactions = [])).push(l);
        n && (l.f ^= Cr), s && u !== null && (u.f & j) === 0 && (l.f ^= j);
      }
      for (c = 0; c < i; c++)
        if (e = t[c], yr(
          /** @type {Derived} */
          e
        ) && Ao(
          /** @type {Derived} */
          e
        ), e.wv > r.wv)
          return !0;
    }
    (!a || p !== null && !H) && I(r, S);
  }
  return !1;
}
function Gt(r, o) {
  for (var t = o; t !== null; ) {
    if ((t.f & Er) !== 0)
      try {
        t.fn(r);
        return;
      } catch {
        t.f ^= Er;
      }
    t = t.parent;
  }
  throw $r = !1, r;
}
function Ht(r) {
  return (r.f & Or) === 0 && (r.parent === null || (r.parent.f & Er) === 0);
}
function Fr(r, o, t, a) {
  if ($r) {
    if (t === null && ($r = !1), Ht(o))
      throw r;
    return;
  }
  t !== null && ($r = !0);
  {
    Gt(r, o);
    return;
  }
}
function Oo(r, o, t = !0) {
  var a = r.reactions;
  if (a !== null)
    for (var c = 0; c < a.length; c++) {
      var e = a[c];
      (e.f & M) !== 0 ? Oo(
        /** @type {Derived} */
        e,
        o,
        !1
      ) : o === e && (t ? I(e, Y) : (e.f & S) !== 0 && I(e, ir), Ir(
        /** @type {Effect} */
        e
      ));
    }
}
function Po(r) {
  var f;
  var o = _, t = C, a = A, c = g, e = H, n = F, s = $, i = R, l = r.f;
  _ = /** @type {null | Value[]} */
  null, C = 0, A = null, H = (l & j) !== 0 && (R || !X || g === null), g = (l & (q | Z)) === 0 ? r : null, F = null, ho(r.ctx), R = !1, jr++;
  try {
    var u = (
      /** @type {Function} */
      (0, r.fn)()
    ), h = r.deps;
    if (_ !== null) {
      var d;
      if (Rr(r, C), h !== null && C > 0)
        for (h.length = C + _.length, d = 0; d < _.length; d++)
          h[C + d] = _[d];
      else
        r.deps = h = _;
      if (!H)
        for (d = C; d < h.length; d++)
          ((f = h[d]).reactions ?? (f.reactions = [])).push(r);
    } else h !== null && C < h.length && (Rr(r, C), h.length = C);
    if (Ko() && A !== null && !R && h !== null && (r.f & (M | ir | Y)) === 0)
      for (d = 0; d < /** @type {Source[]} */
      A.length; d++)
        Oo(
          A[d],
          /** @type {Effect} */
          r
        );
    return c !== null && (jr++, A !== null && (a === null ? a = A : a.push(.../** @type {Source[]} */
    A))), u;
  } finally {
    _ = o, C = t, A = a, g = c, H = e, F = n, ho(s), R = i;
  }
}
function Vt(r, o) {
  let t = o.reactions;
  if (t !== null) {
    var a = wt.call(t, r);
    if (a !== -1) {
      var c = t.length - 1;
      c === 0 ? t = o.reactions = null : (t[a] = t[c], t.pop());
    }
  }
  t === null && (o.f & M) !== 0 && // Destroying a child effect while updating a parent effect can cause a dependency to appear
  // to be unused, when in fact it is used by the currently-updating parent. Checking `new_deps`
  // allows us to skip the expensive work of disconnecting and immediately reconnecting it
  (_ === null || !_.includes(o)) && (I(o, ir), (o.f & (j | Cr)) === 0 && (o.f ^= Cr), So(
    /** @type {Derived} **/
    o
  ), Rr(
    /** @type {Derived} **/
    o,
    0
  ));
}
function Rr(r, o) {
  var t = r.deps;
  if (t !== null)
    for (var a = o; a < t.length; a++)
      Vt(r, t[a]);
}
function Qr(r) {
  var o = r.f;
  if ((o & Or) === 0) {
    I(r, S);
    var t = p, a = $, c = X;
    p = r, X = !0;
    try {
      (o & Jr) !== 0 ? ea(r) : Uo(r), Lo(r);
      var e = Po(r);
      r.teardown = typeof e == "function" ? e : null, r.wv = Ro;
      var n = r.deps, s;
      co && Ft && r.f & Y;
    } catch (i) {
      Fr(i, r, t, a || r.ctx);
    } finally {
      X = c, p = t;
    }
  }
}
function Wt() {
  try {
    Tt();
  } catch (r) {
    if (Tr !== null)
      Fr(r, Tr, null);
    else
      throw r;
  }
}
function Fo() {
  var r = X;
  try {
    var o = 0;
    for (X = !0; hr.length > 0; ) {
      o++ > 1e3 && Wt();
      var t = hr, a = t.length;
      hr = [];
      for (var c = 0; c < a; c++) {
        var e = Xt(t[c]);
        Kt(e);
      }
    }
  } finally {
    Nr = !1, X = r, Tr = null, fr.clear();
  }
}
function Kt(r) {
  var o = r.length;
  if (o !== 0)
    for (var t = 0; t < o; t++) {
      var a = r[t];
      if ((a.f & (Or | lr)) === 0)
        try {
          yr(a) && (Qr(a), a.deps === null && a.first === null && a.nodes_start === null && (a.teardown === null ? qo(a) : a.fn = null));
        } catch (c) {
          Fr(c, a, null, a.ctx);
        }
    }
}
function Ir(r) {
  Nr || (Nr = !0, queueMicrotask(Fo));
  for (var o = Tr = r; o.parent !== null; ) {
    o = o.parent;
    var t = o.f;
    if ((t & (Z | q)) !== 0) {
      if ((t & S) === 0) return;
      o.f ^= S;
    }
  }
  hr.push(o);
}
function Xt(r) {
  for (var o = [], t = r; t !== null; ) {
    var a = t.f, c = (a & (q | Z)) !== 0, e = c && (a & S) !== 0;
    if (!e && (a & lr) === 0) {
      if ((a & po) !== 0)
        o.push(t);
      else if (c)
        t.f ^= S;
      else {
        var n = g;
        try {
          g = t, yr(t) && Qr(t);
        } catch (l) {
          Fr(l, t, null, t.ctx);
        } finally {
          g = n;
        }
      }
      var s = t.first;
      if (s !== null) {
        t = s;
        continue;
      }
    }
    var i = t.parent;
    for (t = t.next; t === null && i !== null; )
      t = i.next, i = i.parent;
  }
  return o;
}
function dr(r) {
  var o;
  for (eo(); hr.length > 0; )
    Nr = !0, Fo(), eo();
  return (
    /** @type {T} */
    o
  );
}
function z(r) {
  var o = r.f, t = (o & M) !== 0;
  if (g !== null && !R) {
    F !== null && F.includes(r) && Ot();
    var a = g.deps;
    r.rv < jr && (r.rv = jr, _ === null && a !== null && a[C] === r ? C++ : _ === null ? _ = [r] : (!H || !_.includes(r)) && _.push(r));
  } else if (t && /** @type {Derived} */
  r.deps === null && /** @type {Derived} */
  r.effects === null) {
    var c = (
      /** @type {Derived} */
      r
    ), e = c.parent;
    e !== null && (e.f & j) === 0 && (c.f ^= j);
  }
  return t && (c = /** @type {Derived} */
  r, yr(c) && Ao(c)), pr && fr.has(r) ? fr.get(r) : r.v;
}
function Dr(r) {
  var o = R;
  try {
    return R = !0, r();
  } finally {
    R = o;
  }
}
const Jt = -7169;
function I(r, o) {
  r.f = r.f & Jt | o;
}
function Zt(r) {
  p === null && g === null && Nt(), g !== null && (g.f & j) !== 0 && p === null && At(), pr && St();
}
function Qt(r, o) {
  var t = o.last;
  t === null ? o.last = o.first = r : (t.next = r, r.prev = t, o.last = r);
}
function rr(r, o, t, a = !0) {
  var c = p, e = {
    ctx: $,
    deps: null,
    nodes_start: null,
    nodes_end: null,
    f: r | Y,
    first: null,
    fn: o,
    last: null,
    next: null,
    parent: c,
    prev: null,
    teardown: null,
    transitions: null,
    wv: 0
  };
  if (t)
    try {
      Qr(e), e.f |= gt;
    } catch (i) {
      throw D(e), i;
    }
  else o !== null && Ir(e);
  var n = t && e.deps === null && e.first === null && e.nodes_start === null && e.teardown === null && (e.f & (yo | Er)) === 0;
  if (!n && a && (c !== null && Qt(e, c), g !== null && (g.f & M) !== 0)) {
    var s = (
      /** @type {Derived} */
      g
    );
    (s.effects ?? (s.effects = [])).push(e);
  }
  return e;
}
function ra(r) {
  const o = rr(Mr, null, !1);
  return I(o, S), o.teardown = r, o;
}
function oa(r) {
  Zt();
  var o = p !== null && (p.f & q) !== 0 && $ !== null && !$.m;
  if (o) {
    var t = (
      /** @type {ComponentContext} */
      $
    );
    (t.e ?? (t.e = [])).push({
      fn: r,
      effect: p,
      reaction: g
    });
  } else {
    var a = Io(r);
    return a;
  }
}
function ta(r) {
  const o = rr(Z, r, !0);
  return () => {
    D(o);
  };
}
function aa(r) {
  const o = rr(Z, r, !0);
  return (t = {}) => new Promise((a) => {
    t.outro ? Yo(o, () => {
      D(o), a(void 0);
    }) : (D(o), a(void 0));
  });
}
function Io(r) {
  return rr(po, r, !1);
}
function Do(r) {
  return rr(Mr, r, !0);
}
function ca(r, o = [], t = Co) {
  const a = o.map(t);
  return ro(() => r(...a.map(z)));
}
function ro(r, o = 0) {
  return rr(Mr | Jr | o, r, !0);
}
function oo(r, o = !0) {
  return rr(Mr | q, r, !0, o);
}
function Lo(r) {
  var o = r.teardown;
  if (o !== null) {
    const t = pr, a = g;
    io(!0), V(null);
    try {
      o.call(null);
    } finally {
      io(t), V(a);
    }
  }
}
function Uo(r, o = !1) {
  var t = r.first;
  for (r.first = r.last = null; t !== null; ) {
    var a = t.next;
    (t.f & Z) !== 0 ? t.parent = null : D(t, o), t = a;
  }
}
function ea(r) {
  for (var o = r.first; o !== null; ) {
    var t = o.next;
    (o.f & q) === 0 && D(o), o = t;
  }
}
function D(r, o = !0) {
  var t = !1;
  if ((o || (r.f & pt) !== 0) && r.nodes_start !== null) {
    for (var a = r.nodes_start, c = r.nodes_end; a !== null; ) {
      var e = a === c ? null : (
        /** @type {TemplateNode} */
        /* @__PURE__ */ Q(a)
      );
      a.remove(), a = e;
    }
    t = !0;
  }
  Uo(r, o && !t), Rr(r, 0), I(r, Or);
  var n = r.transitions;
  if (n !== null)
    for (const i of n)
      i.stop();
  Lo(r);
  var s = r.parent;
  s !== null && s.first !== null && qo(r), r.next = r.prev = r.teardown = r.ctx = r.deps = r.fn = r.nodes_start = r.nodes_end = null;
}
function qo(r) {
  var o = r.parent, t = r.prev, a = r.next;
  t !== null && (t.next = a), a !== null && (a.prev = t), o !== null && (o.first === r && (o.first = a), o.last === r && (o.last = t));
}
function Yo(r, o) {
  var t = [];
  Bo(r, t, !0), na(t, () => {
    D(r), o && o();
  });
}
function na(r, o) {
  var t = r.length;
  if (t > 0) {
    var a = () => --t || o();
    for (var c of r)
      c.out(a);
  } else
    o();
}
function Bo(r, o, t) {
  if ((r.f & lr) === 0) {
    if (r.f ^= lr, r.transitions !== null)
      for (const n of r.transitions)
        (n.is_global || t) && o.push(n);
    for (var a = r.first; a !== null; ) {
      var c = a.next, e = (a.f & Zr) !== 0 || (a.f & q) !== 0;
      Bo(a, o, e ? t : !1), a = c;
    }
  }
}
function la(r) {
  Go(r, !0);
}
function Go(r, o) {
  if ((r.f & lr) !== 0) {
    r.f ^= lr, (r.f & S) === 0 && (r.f ^= S), yr(r) && (I(r, Y), Ir(r));
    for (var t = r.first; t !== null; ) {
      var a = t.next, c = (t.f & Zr) !== 0 || (t.f & q) !== 0;
      Go(t, c ? o : !1), t = a;
    }
    if (r.transitions !== null)
      for (const e of r.transitions)
        (e.is_global || o) && e.in();
  }
}
function Ho(r) {
  throw new Error("https://svelte.dev/e/lifecycle_outside_component");
}
let $ = null;
function ho(r) {
  $ = r;
}
function Vo(r, o = !1, t) {
  var a = $ = {
    p: $,
    c: null,
    d: !1,
    e: null,
    m: !1,
    s: r,
    x: null,
    l: null
  };
  ra(() => {
    a.d = !0;
  });
}
function Wo(r) {
  const o = $;
  if (o !== null) {
    r !== void 0 && (o.x = r);
    const n = o.e;
    if (n !== null) {
      var t = p, a = g;
      o.e = null;
      try {
        for (var c = 0; c < n.length; c++) {
          var e = n[c];
          W(e.effect), V(e.reaction), Io(e.fn);
        }
      } finally {
        W(t), V(a);
      }
    }
    $ = o.p, o.m = !0;
  }
  return r || /** @type {T} */
  {};
}
function Ko() {
  return !0;
}
const sa = ["touchstart", "touchmove"];
function ia(r) {
  return sa.includes(r);
}
const da = (
  /** @type {const} */
  ["textarea", "script", "style", "title"]
);
function ha(r) {
  return da.includes(
    /** @type {RAW_TEXT_ELEMENTS[number]} */
    r
  );
}
let uo = !1;
function Xo() {
  uo || (uo = !0, document.addEventListener(
    "reset",
    (r) => {
      Promise.resolve().then(() => {
        var o;
        if (!r.defaultPrevented)
          for (
            const t of
            /**@type {HTMLFormElement} */
            r.target.elements
          )
            (o = t.__on_r) == null || o.call(t);
      });
    },
    // In the capture phase to guarantee we get noticed of it (no possiblity of stopPropagation)
    { capture: !0 }
  ));
}
function ua(r) {
  var o = g, t = p;
  V(null), W(null);
  try {
    return r();
  } finally {
    V(o), W(t);
  }
}
function fa(r, o, t, a = t) {
  r.addEventListener(o, () => ua(t));
  const c = r.__on_r;
  c ? r.__on_r = () => {
    c(), a(!0);
  } : r.__on_r = () => a(!0), Xo();
}
const Jo = /* @__PURE__ */ new Set(), Vr = /* @__PURE__ */ new Set();
function va(r) {
  for (var o = 0; o < r.length; o++)
    Jo.add(r[o]);
  for (var t of Vr)
    t(r);
}
function xr(r) {
  var G;
  var o = this, t = (
    /** @type {Node} */
    o.ownerDocument
  ), a = r.type, c = ((G = r.composedPath) == null ? void 0 : G.call(r)) || [], e = (
    /** @type {null | Element} */
    c[0] || r.target
  ), n = 0, s = r.__root;
  if (s) {
    var i = c.indexOf(s);
    if (i !== -1 && (o === document || o === /** @type {any} */
    window)) {
      r.__root = o;
      return;
    }
    var l = c.indexOf(o);
    if (l === -1)
      return;
    i <= l && (n = i);
  }
  if (e = /** @type {Element} */
  c[n] || r.target, e !== o) {
    Ar(r, "currentTarget", {
      configurable: !0,
      get() {
        return e || t;
      }
    });
    var u = g, h = p;
    V(null), W(null);
    try {
      for (var d, f = []; e !== null; ) {
        var v = e.assignedSlot || e.parentNode || /** @type {any} */
        e.host || null;
        try {
          var m = e["__" + a];
          if (m != null && (!/** @type {any} */
          e.disabled || // DOM could've been updated already by the time this is reached, so we check this as well
          // -> the target could not have been disabled because it emits the event in the first place
          r.target === e))
            if (ko(m)) {
              var [B, ...b] = m;
              B.apply(e, [r, ...b]);
            } else
              m.call(e, r);
        } catch (O) {
          d ? f.push(O) : d = O;
        }
        if (r.cancelBubble || v === o || v === null)
          break;
        e = v;
      }
      if (d) {
        for (let O of f)
          queueMicrotask(() => {
            throw O;
          });
        throw d;
      }
    } finally {
      r.__root = o, delete r.currentTarget, V(u), W(h);
    }
  }
}
function Zo(r) {
  var o = document.createElement("template");
  return o.innerHTML = r, o.content;
}
function K(r, o) {
  var t = (
    /** @type {Effect} */
    p
  );
  t.nodes_start === null && (t.nodes_start = r, t.nodes_end = o);
}
// @__NO_SIDE_EFFECTS__
function ga(r, o) {
  var t, a = !r.startsWith("<!>");
  return () => {
    if (y)
      return K(k, null), k;
    t === void 0 && (t = Zo(a ? r : "<!>" + r));
    var c = (
      /** @type {TemplateNode} */
      No ? document.importNode(t, !0) : t.cloneNode(!0)
    );
    {
      var e = (
        /** @type {TemplateNode} */
        /* @__PURE__ */ J(c)
      ), n = (
        /** @type {TemplateNode} */
        c.lastChild
      );
      K(e, n);
    }
    return c;
  };
}
function pa() {
  if (y)
    return K(k, null), k;
  var r = document.createDocumentFragment(), o = document.createComment(""), t = gr();
  return r.append(o, t), K(o, t), r;
}
function Wr(r, o) {
  if (y) {
    p.nodes_end = k, sr();
    return;
  }
  r !== null && r.before(
    /** @type {Node} */
    o
  );
}
function Qo(r, o) {
  return rt(r, o);
}
function ya(r, o) {
  Hr(), o.intro = o.intro ?? !1;
  const t = o.target, a = y, c = k;
  try {
    for (var e = (
      /** @type {TemplateNode} */
      /* @__PURE__ */ J(t)
    ); e && (e.nodeType !== 8 || /** @type {Comment} */
    e.data !== ht); )
      e = /** @type {TemplateNode} */
      /* @__PURE__ */ Q(e);
    if (!e)
      throw er;
    cr(!0), U(
      /** @type {Comment} */
      e
    ), sr();
    const n = rt(r, { ...o, anchor: e });
    if (k === null || k.nodeType !== 8 || /** @type {Comment} */
    k.data !== ut)
      throw Pr(), er;
    return cr(!1), /**  @type {Exports} */
    n;
  } catch (n) {
    if (n === er)
      return o.recover === !1 && jt(), Hr(), qt(t), cr(!1), Qo(r, o);
    throw n;
  } finally {
    cr(a), U(c);
  }
}
const or = /* @__PURE__ */ new Map();
function rt(r, { target: o, anchor: t, props: a = {}, events: c, context: e, intro: n = !0 }) {
  Hr();
  var s = /* @__PURE__ */ new Set(), i = (h) => {
    for (var d = 0; d < h.length; d++) {
      var f = h[d];
      if (!s.has(f)) {
        s.add(f);
        var v = ia(f);
        o.addEventListener(f, xr, { passive: v });
        var m = or.get(f);
        m === void 0 ? (document.addEventListener(f, xr, { passive: v }), or.set(f, 1)) : or.set(f, m + 1);
      }
    }
  };
  i(mt(Jo)), Vr.add(i);
  var l = void 0, u = aa(() => {
    var h = t ?? o.appendChild(gr());
    return oo(() => {
      if (e) {
        Vo({});
        var d = (
          /** @type {ComponentContext} */
          $
        );
        d.c = e;
      }
      c && (a.$$events = c), y && K(
        /** @type {TemplateNode} */
        h,
        null
      ), l = r(h, a) || {}, y && (p.nodes_end = k), e && Wo();
    }), () => {
      var v;
      for (var d of s) {
        o.removeEventListener(d, xr);
        var f = (
          /** @type {number} */
          or.get(d)
        );
        --f === 0 ? (document.removeEventListener(d, xr), or.delete(d)) : or.set(d, f);
      }
      Vr.delete(i), h !== t && ((v = h.parentNode) == null || v.removeChild(h));
    };
  });
  return Kr.set(l, u), l;
}
let Kr = /* @__PURE__ */ new WeakMap();
function ka(r, o) {
  const t = Kr.get(r);
  return t ? (Kr.delete(r), t(o)) : Promise.resolve();
}
function wa(r, o, t, a, c) {
  var e = r, n = "", s;
  ro(() => {
    if (n === (n = o() ?? "")) {
      y && sr();
      return;
    }
    s !== void 0 && (D(s), s = void 0), n !== "" && (s = oo(() => {
      if (y) {
        k.data;
        for (var i = sr(), l = i; i !== null && (i.nodeType !== 8 || /** @type {Comment} */
        i.data !== ""); )
          l = i, i = /** @type {TemplateNode} */
          /* @__PURE__ */ Q(i);
        if (i === null)
          throw Pr(), er;
        K(k, l), e = U(i);
        return;
      }
      var u = n + "", h = Zo(u);
      K(
        /** @type {TemplateNode} */
        /* @__PURE__ */ J(h),
        /** @type {TemplateNode} */
        h.lastChild
      ), e.before(h);
    }));
  });
}
function ma(r, o, t, a, c, e) {
  let n = y;
  y && sr();
  var s, i, l = null;
  y && k.nodeType === 1 && (l = /** @type {Element} */
  k, sr());
  var u = (
    /** @type {TemplateNode} */
    y ? k : r
  ), h;
  ro(() => {
    const d = o() || null;
    var f = d === "svg" ? vt : null;
    d !== s && (h && (d === null ? Yo(h, () => {
      h = null, i = null;
    }) : d === i ? la(h) : D(h)), d && d !== i && (h = oo(() => {
      if (l = y ? (
        /** @type {Element} */
        l
      ) : f ? document.createElementNS(f, d) : document.createElement(d), K(l, l), a) {
        y && ha(d) && l.append(document.createComment(""));
        var v = (
          /** @type {TemplateNode} */
          y ? /* @__PURE__ */ J(l) : l.appendChild(gr())
        );
        y && (v === null ? cr(!1) : U(v)), a(l, v);
      }
      p.nodes_end = l, u.before(l);
    })), s = d, s && (i = s));
  }, Zr), n && (cr(!0), U(u));
}
const ba = Symbol("is custom element"), xa = Symbol("is html");
function _a(r) {
  if (y) {
    var o = !1, t = () => {
      if (!o) {
        if (o = !0, r.hasAttribute("value")) {
          var a = r.value;
          Xr(r, "value", null), r.value = a;
        }
        if (r.hasAttribute("checked")) {
          var c = r.checked;
          Xr(r, "checked", null), r.checked = c;
        }
      }
    };
    r.__on_r = t, Et(t), Xo();
  }
}
function Xr(r, o, t, a) {
  var c = $a(r);
  y && (c[o] = r.getAttribute(o), o === "src" || o === "srcset" || o === "href" && r.nodeName === "LINK") || c[o] !== (c[o] = t) && (o === "loading" && (r[kt] = t), t == null ? r.removeAttribute(o) : typeof t != "string" && za(r).includes(o) ? r[o] = t : r.setAttribute(o, t));
}
function $a(r) {
  return (
    /** @type {Record<string | symbol, unknown>} **/
    // @ts-expect-error
    r.__attributes ?? (r.__attributes = {
      [ba]: r.nodeName.includes("-"),
      [xa]: r.namespaceURI === ft
    })
  );
}
var fo = /* @__PURE__ */ new Map();
function za(r) {
  var o = fo.get(r.nodeName);
  if (o) return o;
  fo.set(r.nodeName, o = []);
  for (var t, a = r, c = Element.prototype; c !== a; ) {
    t = bt(a);
    for (var e in t)
      t[e].set && o.push(e);
    a = wo(a);
  }
  return o;
}
function Ea(r, o, t = o) {
  fa(r, "input", (a) => {
    var c = a ? r.defaultValue : r.value;
    if (c = Yr(r) ? Br(c) : c, t(c), c !== (c = o())) {
      var e = r.selectionStart, n = r.selectionEnd;
      r.value = c ?? "", n !== null && (r.selectionStart = e, r.selectionEnd = Math.min(n, r.value.length));
    }
  }), // If we are hydrating and the value has since changed,
  // then use the updated value from the input instead.
  (y && r.defaultValue !== r.value || // If defaultValue is set, then value == defaultValue
  // TODO Svelte 6: remove input.value check and set to empty string?
  Dr(o) == null && r.value) && t(Yr(r) ? Br(r.value) : r.value), Do(() => {
    var a = o();
    Yr(r) && a === Br(r.value) || r.type === "date" && !a && !r.value || a !== r.value && (r.value = a ?? "");
  });
}
function Yr(r) {
  var o = r.type;
  return o === "number" || o === "range";
}
function Br(r) {
  return r === "" ? null : +r;
}
function ot(r) {
  $ === null && Ho(), oa(() => {
    const o = Dr(r);
    if (typeof o == "function") return (
      /** @type {() => void} */
      o
    );
  });
}
function Ca(r) {
  $ === null && Ho(), ot(() => () => Dr(r));
}
const tr = [];
function Sa(r, o = qr) {
  let t = null;
  const a = /* @__PURE__ */ new Set();
  function c(s) {
    if (_o(r, s) && (r = s, t)) {
      const i = !tr.length;
      for (const l of a)
        l[1](), tr.push(l, r);
      if (i) {
        for (let l = 0; l < tr.length; l += 2)
          tr[l][0](tr[l + 1]);
        tr.length = 0;
      }
    }
  }
  function e(s) {
    c(s(
      /** @type {T} */
      r
    ));
  }
  function n(s, i = qr) {
    const l = [s, i];
    return a.add(l), a.size === 1 && (t = o(c, e) || qr), s(
      /** @type {T} */
      r
    ), () => {
      a.delete(l), a.size === 0 && t && (t(), t = null);
    };
  }
  return { set: c, update: e, subscribe: n };
}
function vo(r) {
  var o;
  return ((o = r.ctx) == null ? void 0 : o.d) ?? !1;
}
function _r(r, o, t, a) {
  var c;
  c = /** @type {V} */
  r[o];
  var e = (
    /** @type {V} */
    a
  ), n = !0, s = !1, i = () => (s = !0, n && (n = !1, e = /** @type {V} */
  a), e);
  c === void 0 && a !== void 0 && (c = i());
  var l;
  l = () => {
    var f = (
      /** @type {V} */
      r[o]
    );
    return f === void 0 ? i() : (n = !0, s = !1, f);
  };
  var u = !1, h = /* @__PURE__ */ zo(c), d = /* @__PURE__ */ Co(() => {
    var f = l(), v = z(h);
    return u ? (u = !1, v) : h.v = f;
  });
  return function(f, v) {
    if (arguments.length > 0) {
      const m = v ? z(d) : f;
      if (!d.equals(m)) {
        if (u = !0, T(h, m), s && e !== void 0 && (e = m), vo(d))
          return f;
        Dr(() => z(d));
      }
      return f;
    }
    return vo(d) ? d.v : z(d);
  };
}
function Aa(r) {
  return new Na(r);
}
var L, N;
class Na {
  /**
   * @param {ComponentConstructorOptions & {
   *  component: any;
   * }} options
   */
  constructor(o) {
    /** @type {any} */
    kr(this, L);
    /** @type {Record<string, any>} */
    kr(this, N);
    var e;
    var t = /* @__PURE__ */ new Map(), a = (n, s) => {
      var i = /* @__PURE__ */ zo(s);
      return t.set(n, i), i;
    };
    const c = new Proxy(
      { ...o.props || {}, $$events: {} },
      {
        get(n, s) {
          return z(t.get(s) ?? a(s, Reflect.get(n, s)));
        },
        has(n, s) {
          return s === yt ? !0 : (z(t.get(s) ?? a(s, Reflect.get(n, s))), Reflect.has(n, s));
        },
        set(n, s, i) {
          return T(t.get(s) ?? a(s, i), i), Reflect.set(n, s, i);
        }
      }
    );
    Lr(this, N, (o.hydrate ? ya : Qo)(o.component, {
      target: o.target,
      anchor: o.anchor,
      props: c,
      context: o.context,
      intro: o.intro ?? !1,
      recover: o.recover
    })), (!((e = o == null ? void 0 : o.props) != null && e.$$host) || o.sync === !1) && dr(), Lr(this, L, c.$$events);
    for (const n of Object.keys(x(this, N)))
      n === "$set" || n === "$destroy" || n === "$on" || Ar(this, n, {
        get() {
          return x(this, N)[n];
        },
        /** @param {any} value */
        set(s) {
          x(this, N)[n] = s;
        },
        enumerable: !0
      });
    x(this, N).$set = /** @param {Record<string, any>} next */
    (n) => {
      Object.assign(c, n);
    }, x(this, N).$destroy = () => {
      ka(x(this, N));
    };
  }
  /** @param {Record<string, any>} props */
  $set(o) {
    x(this, N).$set(o);
  }
  /**
   * @param {string} event
   * @param {(...args: any[]) => any} callback
   * @returns {any}
   */
  $on(o, t) {
    x(this, L)[o] = x(this, L)[o] || [];
    const a = (...c) => t.call(this, ...c);
    return x(this, L)[o].push(a), () => {
      x(this, L)[o] = x(this, L)[o].filter(
        /** @param {any} fn */
        (c) => c !== a
      );
    };
  }
  $destroy() {
    x(this, N).$destroy();
  }
}
L = new WeakMap(), N = new WeakMap();
let tt;
typeof HTMLElement == "function" && (tt = class extends HTMLElement {
  /**
   * @param {*} $$componentCtor
   * @param {*} $$slots
   * @param {*} use_shadow_dom
   */
  constructor(o, t, a) {
    super();
    /** The Svelte component constructor */
    w(this, "$$ctor");
    /** Slots */
    w(this, "$$s");
    /** @type {any} The Svelte component instance */
    w(this, "$$c");
    /** Whether or not the custom element is connected */
    w(this, "$$cn", !1);
    /** @type {Record<string, any>} Component props data */
    w(this, "$$d", {});
    /** `true` if currently in the process of reflecting component props back to attributes */
    w(this, "$$r", !1);
    /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
    w(this, "$$p_d", {});
    /** @type {Record<string, EventListenerOrEventListenerObject[]>} Event listeners */
    w(this, "$$l", {});
    /** @type {Map<EventListenerOrEventListenerObject, Function>} Event listener unsubscribe functions */
    w(this, "$$l_u", /* @__PURE__ */ new Map());
    /** @type {any} The managed render effect for reflecting attributes */
    w(this, "$$me");
    this.$$ctor = o, this.$$s = t, a && this.attachShadow({ mode: "open" });
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  addEventListener(o, t, a) {
    if (this.$$l[o] = this.$$l[o] || [], this.$$l[o].push(t), this.$$c) {
      const c = this.$$c.$on(o, t);
      this.$$l_u.set(t, c);
    }
    super.addEventListener(o, t, a);
  }
  /**
   * @param {string} type
   * @param {EventListenerOrEventListenerObject} listener
   * @param {boolean | AddEventListenerOptions} [options]
   */
  removeEventListener(o, t, a) {
    if (super.removeEventListener(o, t, a), this.$$c) {
      const c = this.$$l_u.get(t);
      c && (c(), this.$$l_u.delete(t));
    }
  }
  async connectedCallback() {
    if (this.$$cn = !0, !this.$$c) {
      let o = function(c) {
        return (e) => {
          const n = document.createElement("slot");
          c !== "default" && (n.name = c), Wr(e, n);
        };
      };
      if (await Promise.resolve(), !this.$$cn || this.$$c)
        return;
      const t = {}, a = Ta(this);
      for (const c of this.$$s)
        c in a && (c === "default" && !this.$$d.children ? (this.$$d.children = o(c), t.default = !0) : t[c] = o(c));
      for (const c of this.attributes) {
        const e = this.$$g_p(c.name);
        e in this.$$d || (this.$$d[e] = zr(e, c.value, this.$$p_d, "toProp"));
      }
      for (const c in this.$$p_d)
        !(c in this.$$d) && this[c] !== void 0 && (this.$$d[c] = this[c], delete this[c]);
      this.$$c = Aa({
        component: this.$$ctor,
        target: this.shadowRoot || this,
        props: {
          ...this.$$d,
          $$slots: t,
          $$host: this
        }
      }), this.$$me = ta(() => {
        Do(() => {
          var c;
          this.$$r = !0;
          for (const e of Sr(this.$$c)) {
            if (!((c = this.$$p_d[e]) != null && c.reflect)) continue;
            this.$$d[e] = this.$$c[e];
            const n = zr(
              e,
              this.$$d[e],
              this.$$p_d,
              "toAttribute"
            );
            n == null ? this.removeAttribute(this.$$p_d[e].attribute || e) : this.setAttribute(this.$$p_d[e].attribute || e, n);
          }
          this.$$r = !1;
        });
      });
      for (const c in this.$$l)
        for (const e of this.$$l[c]) {
          const n = this.$$c.$on(c, e);
          this.$$l_u.set(e, n);
        }
      this.$$l = {};
    }
  }
  // We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
  // and setting attributes through setAttribute etc, this is helpful
  /**
   * @param {string} attr
   * @param {string} _oldValue
   * @param {string} newValue
   */
  attributeChangedCallback(o, t, a) {
    var c;
    this.$$r || (o = this.$$g_p(o), this.$$d[o] = zr(o, a, this.$$p_d, "toProp"), (c = this.$$c) == null || c.$set({ [o]: this.$$d[o] }));
  }
  disconnectedCallback() {
    this.$$cn = !1, Promise.resolve().then(() => {
      !this.$$cn && this.$$c && (this.$$c.$destroy(), this.$$me(), this.$$c = void 0);
    });
  }
  /**
   * @param {string} attribute_name
   */
  $$g_p(o) {
    return Sr(this.$$p_d).find(
      (t) => this.$$p_d[t].attribute === o || !this.$$p_d[t].attribute && t.toLowerCase() === o
    ) || o;
  }
});
function zr(r, o, t, a) {
  var e;
  const c = (e = t[r]) == null ? void 0 : e.type;
  if (o = c === "Boolean" && typeof o != "boolean" ? o != null : o, !a || !t[r])
    return o;
  if (a === "toAttribute")
    switch (c) {
      case "Object":
      case "Array":
        return o == null ? null : JSON.stringify(o);
      case "Boolean":
        return o ? "" : null;
      case "Number":
        return o ?? null;
      default:
        return o;
    }
  else
    switch (c) {
      case "Object":
      case "Array":
        return o && JSON.parse(o);
      case "Boolean":
        return o;
      // conversion already handled above
      case "Number":
        return o != null ? +o : o;
      default:
        return o;
    }
}
function Ta(r) {
  const o = {};
  return r.childNodes.forEach((t) => {
    o[
      /** @type {Element} node */
      t.slot || "default"
    ] = !0;
  }), o;
}
function ja(r, o, t, a, c, e) {
  let n = class extends tt {
    constructor() {
      super(r, t, c), this.$$p_d = o;
    }
    static get observedAttributes() {
      return Sr(o).map(
        (s) => (o[s].attribute || s).toLowerCase()
      );
    }
  };
  return Sr(o).forEach((s) => {
    Ar(n.prototype, s, {
      get() {
        return this.$$c && s in this.$$c ? this.$$c[s] : this.$$d[s];
      },
      set(i) {
        var h;
        i = zr(s, i, o), this.$$d[s] = i;
        var l = this.$$c;
        if (l) {
          var u = (h = nr(l, s)) == null ? void 0 : h.get;
          u ? l[s] = i : l.$set({ [s]: i });
        }
      }
    });
  }), a.forEach((s) => {
    Ar(n.prototype, s, {
      get() {
        var i;
        return (i = this.$$c) == null ? void 0 : i[s];
      }
    });
  }), r.element = /** @type {any} */
  n, n;
}
const Ra = '/*! tailwindcss v4.0.14 | MIT License | https://tailwindcss.com */@layer theme{:root,:host{--font-sans:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";--font-mono:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace;--color-red-700:oklch(.505 .213 27.518);--color-yellow-200:oklch(.945 .129 101.54);--color-green-600:oklch(.627 .194 149.214);--color-blue-600:oklch(.546 .245 262.881);--color-blue-800:oklch(.424 .199 265.638);--color-gray-200:oklch(.928 .006 264.531);--color-gray-300:oklch(.872 .01 258.338);--color-gray-400:oklch(.707 .022 261.325);--color-gray-600:oklch(.446 .03 256.802);--color-gray-700:oklch(.373 .034 259.733);--color-gray-900:oklch(.21 .034 264.665);--color-white:#fff;--spacing:.25rem;--breakpoint-sm:40rem;--container-xs:20rem;--container-md:28rem;--text-xs:calc(.75rem*var(--text-scaling));--text-xs--line-height:calc(calc(1/.75)*var(--text-scaling));--text-sm:calc(.875rem*var(--text-scaling));--text-sm--line-height:calc(calc(1.25/.875)*var(--text-scaling));--text-base:calc(1rem*var(--text-scaling));--text-base--line-height:calc( 1.5 *var(--text-scaling));--text-lg:calc(1.125rem*var(--text-scaling));--text-lg--line-height:calc(calc(1.75/1.125)*var(--text-scaling));--text-xl:calc(1.25rem*var(--text-scaling));--text-xl--line-height:calc(calc(1.75/1.25)*var(--text-scaling));--text-2xl:calc(1.5rem*var(--text-scaling));--text-2xl--line-height:calc(calc(2/1.5)*var(--text-scaling));--text-3xl:calc(1.875rem*var(--text-scaling));--text-3xl--line-height:calc( 1.2 *var(--text-scaling));--text-4xl:calc(2.25rem*var(--text-scaling));--text-4xl--line-height:calc(calc(2.5/2.25)*var(--text-scaling));--text-5xl:calc(3rem*var(--text-scaling));--text-5xl--line-height:calc(1*var(--text-scaling));--font-weight-medium:500;--font-weight-semibold:600;--font-weight-bold:700;--leading-tight:1.25;--leading-snug:1.375;--leading-normal:1.5;--leading-relaxed:1.625;--leading-loose:2;--radius-sm:.25rem;--radius-md:.375rem;--ease-in-out:cubic-bezier(.4,0,.2,1);--animate-spin:spin 1s linear infinite;--animate-ping:ping 1s cubic-bezier(0,0,.2,1)infinite;--animate-pulse:pulse 2s cubic-bezier(.4,0,.6,1)infinite;--animate-bounce:bounce 1s infinite;--blur-sm:8px;--default-transition-duration:.15s;--default-transition-timing-function:cubic-bezier(.4,0,.2,1);--default-font-family:var(--font-sans);--default-font-feature-settings:var(--font-sans--font-feature-settings);--default-font-variation-settings:var(--font-sans--font-variation-settings);--default-mono-font-family:var(--font-mono);--default-mono-font-feature-settings:var(--font-mono--font-feature-settings);--default-mono-font-variation-settings:var(--font-mono--font-variation-settings);--text-scaling:1;--base-font-color:inherit;--base-font-color-dark:inherit;--base-font-family:inherit;--base-font-size:inherit;--base-line-height:inherit;--base-font-weight:inherit;--base-font-style:inherit;--base-letter-spacing:inherit;--heading-font-color:inherit;--heading-font-color-dark:inherit;--heading-font-family:inherit;--heading-font-weight:inherit;--heading-font-style:inherit;--heading-letter-spacing:inherit;--anchor-font-color:inherit;--anchor-font-color-dark:inherit;--anchor-font-family:inherit;--anchor-font-size:inherit;--anchor-line-height:inherit;--anchor-font-weight:inherit;--anchor-font-style:inherit;--anchor-letter-spacing:inherit;--anchor-text-decoration:inherit;--anchor-text-decoration-hover:underline;--anchor-text-decoration-active:inherit;--anchor-text-decoration-focus:inherit;--radius-base:.25rem;--radius-container:.25rem;--default-border-width:1px;--default-divide-width:1px;--default-ring-width:1px;--animate-progress-indeterminate:anim-progress-indeterminate 2s linear infinite;--animate-ring-indeterminate:anim-ring-indeterminate 2s linear infinite;--color-primary-50:oklch(98.5% 0 0);--color-primary-100:oklch(97% 0 0);--color-primary-200:oklch(92.2% 0 0);--color-primary-300:oklch(87% 0 0);--color-primary-400:oklch(70.8% 0 0);--color-primary-500:oklch(55.6% 0 0);--color-primary-600:oklch(43.9% 0 0);--color-primary-700:oklch(37.1% 0 0);--color-primary-800:oklch(26.9% 0 0);--color-primary-900:oklch(20.5% 0 0);--color-primary-950:oklch(14.5% 0 0);--color-primary-contrast-dark:var(--color-primary-950);--color-primary-contrast-light:var(--color-primary-50);--color-primary-contrast-50:var(--color-primary-contrast-dark);--color-primary-contrast-100:var(--color-primary-contrast-dark);--color-primary-contrast-200:var(--color-primary-contrast-dark);--color-primary-contrast-300:var(--color-primary-contrast-dark);--color-primary-contrast-400:var(--color-primary-contrast-light);--color-primary-contrast-500:var(--color-primary-contrast-light);--color-primary-contrast-600:var(--color-primary-contrast-light);--color-primary-contrast-700:var(--color-primary-contrast-light);--color-primary-contrast-800:var(--color-primary-contrast-light);--color-primary-contrast-900:var(--color-primary-contrast-light);--color-primary-contrast-950:var(--color-primary-contrast-light);--color-secondary-50:oklch(98.5% 0 0);--color-secondary-100:oklch(97% 0 0);--color-secondary-200:oklch(92.2% 0 0);--color-secondary-300:oklch(87% 0 0);--color-secondary-400:oklch(70.8% 0 0);--color-secondary-500:oklch(55.6% 0 0);--color-secondary-600:oklch(43.9% 0 0);--color-secondary-700:oklch(37.1% 0 0);--color-secondary-800:oklch(26.9% 0 0);--color-secondary-900:oklch(20.5% 0 0);--color-secondary-950:oklch(14.5% 0 0);--color-secondary-contrast-dark:var(--color-secondary-950);--color-secondary-contrast-light:var(--color-secondary-50);--color-secondary-contrast-50:var(--color-secondary-contrast-dark);--color-secondary-contrast-100:var(--color-secondary-contrast-dark);--color-secondary-contrast-200:var(--color-secondary-contrast-dark);--color-secondary-contrast-300:var(--color-secondary-contrast-dark);--color-secondary-contrast-400:var(--color-secondary-contrast-light);--color-secondary-contrast-500:var(--color-secondary-contrast-light);--color-secondary-contrast-600:var(--color-secondary-contrast-light);--color-secondary-contrast-700:var(--color-secondary-contrast-light);--color-secondary-contrast-800:var(--color-secondary-contrast-light);--color-secondary-contrast-900:var(--color-secondary-contrast-light);--color-secondary-contrast-950:var(--color-secondary-contrast-light);--color-tertiary-50:oklch(98.5% 0 0);--color-tertiary-100:oklch(97% 0 0);--color-tertiary-200:oklch(92.2% 0 0);--color-tertiary-300:oklch(87% 0 0);--color-tertiary-400:oklch(70.8% 0 0);--color-tertiary-500:oklch(55.6% 0 0);--color-tertiary-600:oklch(43.9% 0 0);--color-tertiary-700:oklch(37.1% 0 0);--color-tertiary-800:oklch(26.9% 0 0);--color-tertiary-900:oklch(20.5% 0 0);--color-tertiary-950:oklch(14.5% 0 0);--color-tertiary-contrast-dark:var(--color-tertiary-950);--color-tertiary-contrast-light:var(--color-tertiary-50);--color-tertiary-contrast-50:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-100:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-200:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-300:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-400:var(--color-tertiary-contrast-light);--color-tertiary-contrast-500:var(--color-tertiary-contrast-light);--color-tertiary-contrast-600:var(--color-tertiary-contrast-light);--color-tertiary-contrast-700:var(--color-tertiary-contrast-light);--color-tertiary-contrast-800:var(--color-tertiary-contrast-light);--color-tertiary-contrast-900:var(--color-tertiary-contrast-light);--color-tertiary-contrast-950:var(--color-tertiary-contrast-light);--color-success-50:oklch(98.5% 0 0);--color-success-100:oklch(97% 0 0);--color-success-200:oklch(92.2% 0 0);--color-success-300:oklch(87% 0 0);--color-success-400:oklch(70.8% 0 0);--color-success-500:oklch(55.6% 0 0);--color-success-600:oklch(43.9% 0 0);--color-success-700:oklch(37.1% 0 0);--color-success-800:oklch(26.9% 0 0);--color-success-900:oklch(20.5% 0 0);--color-success-950:oklch(14.5% 0 0);--color-success-contrast-dark:var(--color-success-950);--color-success-contrast-light:var(--color-success-50);--color-success-contrast-50:var(--color-success-contrast-dark);--color-success-contrast-100:var(--color-success-contrast-dark);--color-success-contrast-200:var(--color-success-contrast-dark);--color-success-contrast-300:var(--color-success-contrast-dark);--color-success-contrast-400:var(--color-success-contrast-light);--color-success-contrast-500:var(--color-success-contrast-light);--color-success-contrast-600:var(--color-success-contrast-light);--color-success-contrast-700:var(--color-success-contrast-light);--color-success-contrast-800:var(--color-success-contrast-light);--color-success-contrast-900:var(--color-success-contrast-light);--color-success-contrast-950:var(--color-success-contrast-light);--color-warning-50:oklch(98.5% 0 0);--color-warning-100:oklch(97% 0 0);--color-warning-200:oklch(92.2% 0 0);--color-warning-300:oklch(87% 0 0);--color-warning-400:oklch(70.8% 0 0);--color-warning-500:oklch(55.6% 0 0);--color-warning-600:oklch(43.9% 0 0);--color-warning-700:oklch(37.1% 0 0);--color-warning-800:oklch(26.9% 0 0);--color-warning-900:oklch(20.5% 0 0);--color-warning-950:oklch(14.5% 0 0);--color-warning-contrast-dark:var(--color-warning-950);--color-warning-contrast-light:var(--color-warning-50);--color-warning-contrast-50:var(--color-warning-contrast-dark);--color-warning-contrast-100:var(--color-warning-contrast-dark);--color-warning-contrast-200:var(--color-warning-contrast-dark);--color-warning-contrast-300:var(--color-warning-contrast-dark);--color-warning-contrast-400:var(--color-warning-contrast-light);--color-warning-contrast-500:var(--color-warning-contrast-light);--color-warning-contrast-600:var(--color-warning-contrast-light);--color-warning-contrast-700:var(--color-warning-contrast-light);--color-warning-contrast-800:var(--color-warning-contrast-light);--color-warning-contrast-900:var(--color-warning-contrast-light);--color-warning-contrast-950:var(--color-warning-contrast-light);--color-error-50:oklch(98.5% 0 0);--color-error-100:oklch(97% 0 0);--color-error-200:oklch(92.2% 0 0);--color-error-300:oklch(87% 0 0);--color-error-400:oklch(70.8% 0 0);--color-error-500:oklch(55.6% 0 0);--color-error-600:oklch(43.9% 0 0);--color-error-700:oklch(37.1% 0 0);--color-error-800:oklch(26.9% 0 0);--color-error-900:oklch(20.5% 0 0);--color-error-950:oklch(14.5% 0 0);--color-error-contrast-dark:var(--color-error-950);--color-error-contrast-light:var(--color-error-50);--color-error-contrast-50:var(--color-error-contrast-dark);--color-error-contrast-100:var(--color-error-contrast-dark);--color-error-contrast-200:var(--color-error-contrast-dark);--color-error-contrast-300:var(--color-error-contrast-dark);--color-error-contrast-400:var(--color-error-contrast-light);--color-error-contrast-500:var(--color-error-contrast-light);--color-error-contrast-600:var(--color-error-contrast-light);--color-error-contrast-700:var(--color-error-contrast-light);--color-error-contrast-800:var(--color-error-contrast-light);--color-error-contrast-900:var(--color-error-contrast-light);--color-error-contrast-950:var(--color-error-contrast-light);--color-surface-50:oklch(98.5% 0 0);--color-surface-100:oklch(97% 0 0);--color-surface-200:oklch(92.2% 0 0);--color-surface-300:oklch(87% 0 0);--color-surface-400:oklch(70.8% 0 0);--color-surface-500:oklch(55.6% 0 0);--color-surface-600:oklch(43.9% 0 0);--color-surface-700:oklch(37.1% 0 0);--color-surface-800:oklch(26.9% 0 0);--color-surface-900:oklch(20.5% 0 0);--color-surface-950:oklch(14.5% 0 0);--color-surface-contrast-dark:var(--color-surface-950);--color-surface-contrast-light:var(--color-surface-50);--color-surface-contrast-50:var(--color-surface-contrast-dark);--color-surface-contrast-100:var(--color-surface-contrast-dark);--color-surface-contrast-200:var(--color-surface-contrast-dark);--color-surface-contrast-300:var(--color-surface-contrast-dark);--color-surface-contrast-400:var(--color-surface-contrast-light);--color-surface-contrast-500:var(--color-surface-contrast-light);--color-surface-contrast-600:var(--color-surface-contrast-light);--color-surface-contrast-700:var(--color-surface-contrast-light);--color-surface-contrast-800:var(--color-surface-contrast-light);--color-surface-contrast-900:var(--color-surface-contrast-light);--color-surface-contrast-950:var(--color-surface-contrast-light);--body-background-color:var(--color-surface-50);--body-background-color-dark:var(--color-surface-950);--color-primary-50-950:light-dark(var(--color-primary-50),var(--color-primary-950));--color-primary-contrast-50-950:light-dark(var(--color-primary-contrast-50),var(--color-primary-contrast-950));--color-primary-100-900:light-dark(var(--color-primary-100),var(--color-primary-900));--color-primary-950-50:light-dark(var(--color-primary-950),var(--color-primary-50));--color-primary-contrast-950-50:light-dark(var(--color-primary-contrast-950),var(--color-primary-contrast-50));--color-surface-50-950:light-dark(var(--color-surface-50),var(--color-surface-950));--color-surface-contrast-50-950:light-dark(var(--color-surface-contrast-50),var(--color-surface-contrast-950));--color-surface-100-900:light-dark(var(--color-surface-100),var(--color-surface-900));--color-surface-contrast-100-900:light-dark(var(--color-surface-contrast-100),var(--color-surface-contrast-900));--color-surface-200-800:light-dark(var(--color-surface-200),var(--color-surface-800));--color-surface-contrast-200-800:light-dark(var(--color-surface-contrast-200),var(--color-surface-contrast-800));--color-surface-300-700:light-dark(var(--color-surface-300),var(--color-surface-700));--color-surface-600-400:light-dark(var(--color-surface-600),var(--color-surface-400));--color-surface-700-300:light-dark(var(--color-surface-700),var(--color-surface-300));--color-surface-800-200:light-dark(var(--color-surface-800),var(--color-surface-200));--color-surface-950-50:light-dark(var(--color-surface-950),var(--color-surface-50))}}@layer base{*,:after,:before,::backdrop{box-sizing:border-box;border:0 solid;margin:0;padding:0}::file-selector-button{box-sizing:border-box;border:0 solid;margin:0;padding:0}html,:host{-webkit-text-size-adjust:100%;-moz-tab-size:4;-o-tab-size:4;tab-size:4;line-height:1.5;font-family:var(--default-font-family,ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji");font-feature-settings:var(--default-font-feature-settings,normal);font-variation-settings:var(--default-font-variation-settings,normal);-webkit-tap-highlight-color:transparent}body{line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){-webkit-text-decoration:underline dotted;text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;-webkit-text-decoration:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,samp,pre{font-family:var(--default-mono-font-family,ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace);font-feature-settings:var(--default-mono-font-feature-settings,normal);font-variation-settings:var(--default-mono-font-variation-settings,normal);font-size:1em}small{font-size:80%}sub,sup{vertical-align:baseline;font-size:75%;line-height:0;position:relative}sub{bottom:-.25em}sup{top:-.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}:-moz-focusring{outline:auto}progress{vertical-align:baseline}summary{display:list-item}ol,ul,menu{list-style:none}img,svg,video,canvas,audio,iframe,embed,object{vertical-align:middle;display:block}img,video{max-width:100%;height:auto}button,input,select,optgroup,textarea{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}::file-selector-button{font:inherit;font-feature-settings:inherit;font-variation-settings:inherit;letter-spacing:inherit;color:inherit;opacity:1;background-color:#0000;border-radius:0}:where(select:is([multiple],[size])) optgroup{font-weight:bolder}:where(select:is([multiple],[size])) optgroup option{padding-inline-start:20px}::file-selector-button{margin-inline-end:4px}::-moz-placeholder{opacity:1;color:color-mix(in oklab,currentColor 50%,transparent)}::placeholder{opacity:1;color:color-mix(in oklab,currentColor 50%,transparent)}textarea{resize:vertical}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-date-and-time-value{min-height:1lh;text-align:inherit}::-webkit-datetime-edit{display:inline-flex}::-webkit-datetime-edit-fields-wrapper{padding:0}::-webkit-datetime-edit{padding-block:0}::-webkit-datetime-edit-year-field{padding-block:0}::-webkit-datetime-edit-month-field{padding-block:0}::-webkit-datetime-edit-day-field{padding-block:0}::-webkit-datetime-edit-hour-field{padding-block:0}::-webkit-datetime-edit-minute-field{padding-block:0}::-webkit-datetime-edit-second-field{padding-block:0}::-webkit-datetime-edit-millisecond-field{padding-block:0}::-webkit-datetime-edit-meridiem-field{padding-block:0}:-moz-ui-invalid{box-shadow:none}button,input:where([type=button],[type=reset],[type=submit]){-webkit-appearance:button;-moz-appearance:button;appearance:button}::file-selector-button{-webkit-appearance:button;-moz-appearance:button;appearance:button}::-webkit-inner-spin-button{height:auto}::-webkit-outer-spin-button{height:auto}[hidden]:where(:not([hidden=until-found])){display:none!important}:root{color-scheme:light;scrollbar-color:var(--color-surface-300-700)var(--color-surface-100-900);scrollbar-width:thin}@media (prefers-color-scheme:dark){:root{color-scheme:dark}}html{-webkit-tap-highlight-color:color-mix(in oklab,var(--color-primary-500)30%,transparent)}body{background-color:var(--body-background-color);color:var(--base-font-color);font-family:var(--base-font-family);font-size:var(--base-font-size);line-height:var(--base-line-height);font-weight:var(--base-font-weight);font-style:var(--base-font-style);letter-spacing:var(--base-letter-spacing)}@media (prefers-color-scheme:dark){body{background-color:var(--body-background-color-dark);color:var(--base-font-color-dark)}}button:not(:disabled),[role=button]:not(:disabled){cursor:pointer}::-moz-selection{background-color:var(--color-primary-500)}::selection{background-color:var(--color-primary-500)}:disabled,.disabled{opacity:.5}:is(:disabled,.disabled)>*{pointer-events:none}}@layer components;@layer utilities{.pointer-events-none{pointer-events:none}.collapse{visibility:collapse}.visible{visibility:visible}.del{background-color:var(--color-error-500);color:var(--color-error-contrast-500);font-family:var(--font-mono);padding:calc(var(--spacing)*.5);padding-left:calc(var(--spacing)*5);text-decoration:none;display:block;position:relative}.del:before{left:calc(var(--spacing)*1);font-family:var(--font-mono);content:"−";position:absolute}.ins{background-color:var(--color-success-500);color:var(--color-success-contrast-500);font-family:var(--font-mono);padding:calc(var(--spacing)*.5);padding-left:calc(var(--spacing)*5);text-decoration:none;display:block;position:relative}.ins:before{left:calc(var(--spacing)*1);font-family:var(--font-mono);content:"+";position:absolute}.table{font-size:var(--text-sm);line-height:var(--text-sm--line-height);width:100%;position:relative}.table thead{color:var(--color-surface-700-300);border-bottom-width:1px;border-color:var(--color-surface-200-800)}.table th{text-align:left;font-weight:400}.table tbody>:not(:last-child){border-color:var(--color-surface-200-800);border-top-width:0;border-bottom-width:1px}.table tfoot{border-top-width:1px;border-color:var(--color-surface-200-800);background-color:var(--color-surface-100-900)}.table th,.table td{padding:calc(var(--spacing)*2)}.table caption{color:var(--color-surface-600-400);font-size:var(--text-xs);line-height:var(--text-xs--line-height)}.absolute{position:absolute}.fixed{position:fixed}.relative{position:relative}.static{position:static}.top-0{top:calc(var(--spacing)*0)}.top-5{top:calc(var(--spacing)*5)}.top-\\[var\\(--top\\)\\]{top:var(--top)}.right-0{right:calc(var(--spacing)*0)}.right-5{right:calc(var(--spacing)*5)}.bottom-0{bottom:calc(var(--spacing)*0)}.left-0{left:calc(var(--spacing)*0)}.left-\\[var\\(--left\\)\\]{left:var(--left)}.isolate{isolation:isolate}.z-50{z-index:50}.z-\\[1\\]{z-index:1}.z-\\[888\\]{z-index:888}.z-\\[998\\]{z-index:998}.z-\\[999\\]{z-index:999}.container{width:100%}@media (width>=40rem){.container{max-width:40rem}}@media (width>=48rem){.container{max-width:48rem}}@media (width>=64rem){.container{max-width:64rem}}@media (width>=80rem){.container{max-width:80rem}}@media (width>=96rem){.container{max-width:96rem}}.mx-auto{margin-inline:auto}.my-4{margin-block:calc(var(--spacing)*4)}.select{border-radius:var(--radius-base);width:100%;font-size:var(--text-base);line-height:var(--text-base--line-height);padding-block:calc(var(--spacing)*1);padding-inline:calc(var(--spacing)*3);--tw-ring-inset:inset;--tw-ring-color:var(--color-surface-200-800);--tw-ring-shadow:var(--tw-ring-inset,)0 0 0 var(--default-ring-width)var(--tw-ring-color,currentColor);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow);background-color:#0000;border-width:0;outline-color:#0000;display:block}.select:active,.select:focus,.select:focus-within{--tw-ring-color:var(--color-primary-500)}.select>*+*{margin-top:calc(var(--spacing)*2)}.select[multiple]{border-radius:var(--radius-container);padding:calc(var(--spacing)*1)}.select[multiple] optgroup,.select[multiple] option{background-color:#0000}.select[size]{border-radius:var(--radius-container);padding:calc(var(--spacing)*1)}.select[size] optgroup,.select[size] option{background-color:#0000}.select optgroup{background-color:var(--color-surface-50-950);color:var(--color-surface-950-50)}.select optgroup>*+*,.select optgroup option:first-of-type{margin-top:calc(var(--spacing)*2)}.select optgroup option:last-child{margin-bottom:calc(var(--spacing)*2)!important}.select option{background-color:var(--color-surface-50-950);color:var(--color-surface-950-50);border-radius:var(--radius-base);font-size:var(--text-base);line-height:calc(var(--spacing)*9);height:calc(var(--spacing)*9);padding:calc(var(--spacing)*2)}.select option:checked{background-image:linear-gradient(0deg,var(--color-primary-500)0%,var(--color-primary-500)100%)!important;color:var(--color-primary-contrast-950-50)!important}.label{width:100%;display:block}.label>*+*,.mt-1{margin-top:calc(var(--spacing)*1)}.mt-2{margin-top:calc(var(--spacing)*2)}.input{border-radius:var(--radius-base);width:100%;font-size:var(--text-base);line-height:var(--text-base--line-height);padding-block:calc(var(--spacing)*1);padding-inline:calc(var(--spacing)*3);--tw-ring-inset:inset;--tw-ring-color:var(--color-surface-200-800);--tw-ring-shadow:var(--tw-ring-inset,)0 0 0 var(--default-ring-width)var(--tw-ring-color,currentColor);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow);background-color:#0000;border-width:0;outline-color:#0000;display:block}.input:active,.input:focus,.input:focus-within{--tw-ring-color:var(--color-primary-500)}.input::-moz-placeholder{color:var(--color-surface-700-300)}.input::placeholder{color:var(--color-surface-700-300)}.input[type=file]::file-selector-button{cursor:pointer;border-radius:var(--radius-base);background-color:var(--color-surface-950-50);color:var(--color-surface-50-950);transform:translateY(calc(var(--spacing)*-.5));margin-right:calc(var(--spacing)*2);text-transform:capitalize;font-size:var(--text-xs);height:var(--text-xs--line-height);padding-block:calc(var(--spacing)*0);padding-inline:calc(var(--spacing)*3)}.input[type=range]{accent-color:var(--color-surface-950-50);box-shadow:none}.input[type=color]{border-radius:var(--radius-base);width:calc(var(--spacing)*8.5);height:calc(var(--spacing)*8.5);-webkit-appearance:none;border:none;outline:none;padding:0}.input[type=color]::-webkit-color-swatch-wrapper{padding:0}.input[type=color]::-webkit-color-swatch{border-radius:var(--radius-base);border:none}.mb-4{margin-bottom:calc(var(--spacing)*4)}.ml-4{margin-left:calc(var(--spacing)*4)}.ml-6{margin-left:calc(var(--spacing)*6)}.btn-icon{box-sizing:content-box;border-radius:var(--radius-base);white-space:nowrap;font-size:var(--text-base);width:var(--text-base);height:var(--text-base);padding:calc(var(--spacing)*2);justify-content:center;align-items:center;text-decoration-line:none;display:inline-flex}@media (hover:hover){.btn-icon:hover{filter:brightness(125%)}@media (prefers-color-scheme:dark){.btn-icon:hover{filter:brightness(75%)}}}.textarea{border-radius:var(--radius-base);width:100%;font-size:var(--text-base);line-height:var(--text-base--line-height);padding-block:calc(var(--spacing)*1);padding-inline:calc(var(--spacing)*3);--tw-ring-inset:inset;--tw-ring-color:var(--color-surface-200-800);--tw-ring-shadow:var(--tw-ring-inset,)0 0 0 var(--default-ring-width)var(--tw-ring-color,currentColor);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow);background-color:#0000;border-width:0;outline-color:#0000;display:block}.textarea:active,.textarea:focus,.textarea:focus-within{--tw-ring-color:var(--color-primary-500)}.textarea::-moz-placeholder{color:var(--color-surface-800-200)}.textarea::placeholder{color:var(--color-surface-800-200)}.hr{border-color:var(--color-surface-200-800);border-top-width:1px;width:100%;display:block}.fieldset{width:100%;display:block}.btn{border-radius:var(--radius-base);justify-content:center;align-items:center;gap:calc(var(--spacing)*2);white-space:nowrap;font-size:var(--text-base);line-height:var(--text-base--line-height);padding-block:calc(var(--spacing)*1);padding-inline:calc(var(--spacing)*4);transition-property:all;transition-timing-function:var(--default-transition-timing-function);transition-duration:var(--default-transition-duration);flex-direction:row;text-decoration-line:none;display:inline-flex}@media (hover:hover){.btn:hover{filter:brightness(125%)}@media (prefers-color-scheme:dark){.btn:hover{filter:brightness(75%)}}}.chip{border-radius:var(--radius-base);justify-content:center;align-items:center;gap:calc(var(--spacing)*2);white-space:nowrap;font-size:var(--text-xs);line-height:var(--text-xs--line-height);padding-block:calc(var(--spacing)*1);padding-inline:calc(var(--spacing)*3);transition-property:all;transition-timing-function:var(--default-transition-timing-function);transition-duration:var(--default-transition-duration);flex-direction:row;text-decoration-line:none;display:inline-flex}@media (hover:hover){.chip:hover{filter:brightness(125%)}@media (prefers-color-scheme:dark){.chip:hover{filter:brightness(75%)}}}.badge{border-radius:var(--radius-base);justify-content:center;align-items:center;gap:calc(var(--spacing)*2);white-space:nowrap;font-size:var(--text-xs);line-height:var(--text-xs--line-height);padding-block:calc(var(--spacing)*1);padding-inline:calc(var(--spacing)*3);flex-direction:row;text-decoration-line:none;display:inline-flex}.ig-btn{justify-content:center;align-items:center;gap:calc(var(--spacing)*2);white-space:nowrap;font-size:var(--text-base);line-height:var(--text-base--line-height);padding-block:calc(var(--spacing)*1);padding-inline:calc(var(--spacing)*4);transition-property:all;transition-timing-function:var(--default-transition-timing-function);transition-duration:var(--default-transition-duration);flex-direction:row;text-decoration-line:none;display:inline-flex}@media (hover:hover){.ig-btn:hover{filter:brightness(125%)}@media (prefers-color-scheme:dark){.ig-btn:hover{filter:brightness(75%)}}}.input-group{border-radius:var(--radius-base);--tw-ring-inset:inset;--tw-ring-color:var(--color-surface-200-800);--tw-ring-shadow:var(--tw-ring-inset,)0 0 0 var(--default-ring-width)var(--tw-ring-color,currentColor);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow);border-width:0;outline-color:#0000;align-items:stretch;display:grid;overflow:hidden}.input-group>*+*{border-color:var(--color-surface-200-800);border-left-width:1px!important}.label-text{font-size:var(--text-xs);line-height:var(--text-xs--line-height);font-weight:var(--font-weight-medium);text-decoration-line:none;display:block}.block{display:block}.contents{display:contents}.flex{display:flex}.grid{display:grid}.hidden{display:none}.inline{display:inline}.inline-block{display:inline-block}.inline-flex{display:inline-flex}.table{display:table}.aspect-square{aspect-ratio:1}.checkbox{--tw-ring-color:var(--color-surface-200-800);cursor:pointer;background-color:var(--color-surface-300-700);border-radius:var(--radius-sm);height:calc(var(--spacing)*5);width:calc(var(--spacing)*5)}.checkbox:focus-within{--tw-ring-color:var(--color-primary-500)}@media (hover:hover){.checkbox:hover{filter:brightness(105%)}}.checkbox:focus{filter:brightness(105%)}.checkbox:checked{background-color:var(--color-primary-500)}@media (hover:hover){.checkbox:checked:hover{background-color:var(--color-primary-500)}}.checkbox:checked:focus{background-color:var(--color-primary-500);border:0}.checkbox:indeterminate{background-color:var(--color-primary-500)}@media (hover:hover){.checkbox:indeterminate:hover{background-color:var(--color-primary-500)}}.checkbox:indeterminate:focus{background-color:var(--color-primary-500);border:0}.radio{--tw-ring-color:var(--color-surface-200-800);cursor:pointer;background-color:var(--color-surface-300-700);border-radius:var(--radius-sm);height:calc(var(--spacing)*5);width:calc(var(--spacing)*5);border-radius:100%}.radio:focus-within{--tw-ring-color:var(--color-primary-500)}@media (hover:hover){.radio:hover{filter:brightness(105%)}}.radio:focus{filter:brightness(105%)}.radio:checked{background-color:var(--color-primary-500)}@media (hover:hover){.radio:checked:hover{background-color:var(--color-primary-500)}}.radio:checked:focus{background-color:var(--color-primary-500);border:0}.progress{webkit-appearance:none;-webkit-appearance:none;-moz-appearance:none;appearance:none;border-radius:var(--radius-base);background-color:var(--color-surface-200-800);width:100%;height:calc(var(--spacing)*2);overflow:hidden}.progress::-webkit-progress-bar{background-color:var(--color-surface-200-800)}.progress::-webkit-progress-value{background-color:var(--color-surface-950-50)}.progress::-moz-progress-bar{background-color:var(--color-surface-950-50)}.progress:indeterminate::-moz-progress-bar{width:0}.btn-icon-sm{font-size:var(--text-xs);width:var(--text-xs);height:var(--text-xs);padding:calc(var(--spacing)*1.5)}.size-8{width:calc(var(--spacing)*8);height:calc(var(--spacing)*8)}.size-16{width:calc(var(--spacing)*16);height:calc(var(--spacing)*16)}.size-32{width:calc(var(--spacing)*32);height:calc(var(--spacing)*32)}.size-full{width:100%;height:100%}.\\!h-auto{height:auto!important}.h-1{height:calc(var(--spacing)*1)}.h-1\\.5{height:calc(var(--spacing)*1.5)}.h-2{height:calc(var(--spacing)*2)}.h-3{height:calc(var(--spacing)*3)}.h-5{height:calc(var(--spacing)*5)}.h-6{height:calc(var(--spacing)*6)}.h-7{height:calc(var(--spacing)*7)}.h-10{height:calc(var(--spacing)*10)}.h-20{height:calc(var(--spacing)*20)}.h-\\[480px\\]{height:480px}.h-\\[500px\\]{height:500px}.h-\\[var\\(--height\\)\\]{height:var(--height)}.h-full{height:100%}.h-screen{height:100vh}.max-h-\\[480px\\]{max-height:480px}.max-h-\\[calc\\(100\\%-100px\\)\\]{max-height:calc(100% - 100px)}.placeholder{background-color:var(--color-surface-200-800);border-radius:var(--radius-base);min-height:calc(var(--spacing)*4)}.w-3{width:calc(var(--spacing)*3)}.w-5{width:calc(var(--spacing)*5)}.w-6{width:calc(var(--spacing)*6)}.w-7{width:calc(var(--spacing)*7)}.w-10{width:calc(var(--spacing)*10)}.w-24{width:calc(var(--spacing)*24)}.w-64{width:calc(var(--spacing)*64)}.w-\\[480px\\]{width:480px}.w-\\[var\\(--width\\)\\]{width:var(--width)}.w-full{width:100%}.max-w-\\[480px\\]{max-width:480px}.max-w-md{max-width:var(--container-md)}.max-w-screen-sm{max-width:var(--breakpoint-sm)}.max-w-xs{max-width:var(--container-xs)}.min-w-\\[320px\\]{min-width:320px}.flex-1{flex:1}.grow{flex-grow:1}.border-collapse{border-collapse:collapse}.translate-x-4{--tw-translate-x:calc(var(--spacing)*4);translate:var(--tw-translate-x)var(--tw-translate-y)}.translate-y-\\[1px\\]{--tw-translate-y:1px;translate:var(--tw-translate-x)var(--tw-translate-y)}.transform{transform:var(--tw-rotate-x)var(--tw-rotate-y)var(--tw-rotate-z)var(--tw-skew-x)var(--tw-skew-y)}.animate-bounce{animation:var(--animate-bounce)}.animate-ping{animation:var(--animate-ping)}.animate-progress-indeterminate{animation:var(--animate-progress-indeterminate)}.animate-pulse{animation:var(--animate-pulse)}.animate-ring-indeterminate{animation:var(--animate-ring-indeterminate)}.animate-spin{animation:var(--animate-spin)}.cursor-not-allowed{cursor:not-allowed}.cursor-pointer{cursor:pointer}.resize{resize:both}.list-decimal{list-style-type:decimal}.list-disc{list-style-type:disc}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}.grid-cols-\\[1fr_auto\\]{grid-template-columns:1fr auto}.grid-cols-\\[auto_1fr_auto\\]{grid-template-columns:auto 1fr auto}.flex-col{flex-direction:column}.flex-row{flex-direction:row}.flex-wrap{flex-wrap:wrap}.items-center{align-items:center}.items-end{align-items:flex-end}.items-start{align-items:flex-start}.items-stretch{align-items:stretch}.justify-between{justify-content:space-between}.justify-center{justify-content:center}.justify-end{justify-content:flex-end}.justify-start{justify-content:flex-start}.gap-0{gap:calc(var(--spacing)*0)}.gap-1{gap:calc(var(--spacing)*1)}.gap-2{gap:calc(var(--spacing)*2)}.gap-3{gap:calc(var(--spacing)*3)}.gap-4{gap:calc(var(--spacing)*4)}:where(.space-y-1>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*1)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*1)*calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-2>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*2)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*2)*calc(1 - var(--tw-space-y-reverse)))}:where(.space-y-4>:not(:last-child)){--tw-space-y-reverse:0;margin-block-start:calc(calc(var(--spacing)*4)*var(--tw-space-y-reverse));margin-block-end:calc(calc(var(--spacing)*4)*calc(1 - var(--tw-space-y-reverse)))}:where(.space-x-4>:not(:last-child)){--tw-space-x-reverse:0;margin-inline-start:calc(calc(var(--spacing)*4)*var(--tw-space-x-reverse));margin-inline-end:calc(calc(var(--spacing)*4)*calc(1 - var(--tw-space-x-reverse)))}.overflow-auto{overflow:auto}.overflow-hidden{overflow:hidden}.pre{-webkit-backdrop-filter:blur(var(--blur-sm));backdrop-filter:blur(var(--blur-sm));border-radius:var(--radius-container);color:var(--color-white);font-size:var(--text-xs);white-space:pre-wrap;padding:calc(var(--spacing)*4);background-color:#000000d9;overflow-x:auto}.code:not(pre .code,.ec-line .code){background-color:var(--color-primary-100-900);border-radius:var(--radius-base);color:var(--color-primary-contrast-50-950);font-family:var(--font-mono);font-size:var(--text-xs);white-space:nowrap;padding-inline:calc(var(--spacing)*1.5);padding-block:calc(var(--spacing)*.75);overflow-x:auto}.overflow-x-auto{overflow-x:auto}.overflow-x-hidden{overflow-x:hidden}.mark{color:var(--color-tertiary-contrast-500);background-color:var(--color-tertiary-500);border-radius:var(--radius-sm);padding-inline:calc(var(--spacing)*1)}.card{border-radius:var(--radius-container)}.card a{transition-property:all;transition-timing-function:var(--default-transition-timing-function);transition-duration:var(--default-transition-duration)}@media (hover:hover){.card a:hover{filter:brightness(95%)}@media (prefers-color-scheme:dark){.card a:hover{filter:brightness(110%)}}}.rounded{border-radius:.25rem}.rounded-base{border-radius:var(--radius-base)}.rounded-container{border-radius:var(--radius-container)}.rounded-full{border-radius:3.40282e38px}.rounded-md{border-radius:var(--radius-md)}.border{border-style:var(--tw-border-style);border-width:1px}.border-2{border-style:var(--tw-border-style);border-width:2px}.border-\\[1px\\]{border-style:var(--tw-border-style);border-width:1px}.preset-outlined-surface-200-800{border-width:1px;border-color:var(--color-surface-200-800)}.ig-input{--tw-ring-inset:inset;background-color:#0000;border-width:0}.ig-input:active,.ig-input:focus,.ig-input:focus-within{--tw-ring-color:var(--color-primary-500)}.border-t-2{border-top-style:var(--tw-border-style);border-top-width:2px}.border-b,.border-b-\\[1px\\]{border-bottom-style:var(--tw-border-style);border-bottom-width:1px}.border-b-\\[3px\\]{border-bottom-style:var(--tw-border-style);border-bottom-width:3px}.border-l-4{border-left-style:var(--tw-border-style);border-left-width:4px}.blockquote{border-left-width:3px;border-left-color:var(--color-primary-500);padding-left:calc(var(--spacing)*4);font-style:italic}.border-dashed{--tw-border-style:dashed;border-style:dashed}.border-dotted{--tw-border-style:dotted;border-style:dotted}.input-ghost{--tw-ring-color:transparent;background-color:#0000;border-color:#0000;outline-color:#0000;padding:0}.input-ghost:active,.input-ghost:focus,.input-ghost:focus-within{border-color:#0000!important}.border-error-500{border-color:var(--color-error-500)}.border-gray-300{border-color:var(--color-gray-300)}.border-gray-400{border-color:var(--color-gray-400)}.border-success-500{border-color:var(--color-success-500)}.border-surface-200-800{border-color:light-dark(var(--color-surface-200),var(--color-surface-800))}.border-surface-500{border-color:var(--color-surface-500)}.border-transparent{border-color:#0000}.border-warning-500{border-color:var(--color-warning-500)}.border-b-primary-500{border-bottom-color:var(--color-primary-500)}.border-b-surface-500{border-bottom-color:var(--color-surface-500)}.border-b-surface-950-50{border-bottom-color:light-dark(var(--color-surface-950),var(--color-surface-50))}.preset-filled{background-color:var(--color-surface-950-50);color:var(--color-surface-50-950)}.preset-filled-error-500{color:var(--color-error-contrast-500);background-color:var(--color-error-500)}.preset-filled-primary-500{color:var(--color-primary-contrast-500);background-color:var(--color-primary-500)}.preset-filled-success-500{color:var(--color-success-contrast-500);background-color:var(--color-success-500)}.preset-filled-surface-50-950{color:var(--color-surface-contrast-50-950);background-color:var(--color-surface-50-950)}.preset-filled-surface-100-900{color:var(--color-surface-contrast-100-900);background-color:var(--color-surface-100-900)}.preset-filled-surface-200-800{color:var(--color-surface-contrast-200-800);background-color:var(--color-surface-200-800)}.preset-filled-surface-500{color:var(--color-surface-contrast-500);background-color:var(--color-surface-500)}.preset-filled-warning-500{color:var(--color-warning-contrast-500);background-color:var(--color-warning-500)}.preset-tonal-primary{background-color:var(--color-primary-50-950);color:var(--color-primary-950-50)}.\\!bg-surface-200{background-color:var(--color-surface-200)!important}.\\!bg-white{background-color:var(--color-white)!important}.bg-error-500{background-color:var(--color-error-500)}.bg-gray-200{background-color:var(--color-gray-200)}.bg-gray-900{background-color:var(--color-gray-900)}.bg-success-500{background-color:var(--color-success-500)}.bg-surface-50{background-color:var(--color-surface-50)}.bg-surface-50-950{background-color:light-dark(var(--color-surface-50),var(--color-surface-950))}.bg-surface-50\\/75{background-color:color-mix(in oklab,var(--color-surface-50)75%,transparent)}.bg-surface-100-900{background-color:light-dark(var(--color-surface-100),var(--color-surface-900))}.bg-surface-200-800{background-color:light-dark(var(--color-surface-200),var(--color-surface-800))}.bg-surface-400-600{background-color:light-dark(var(--color-surface-400),var(--color-surface-600))}.bg-surface-500{background-color:var(--color-surface-500)}.bg-surface-950{background-color:var(--color-surface-950)}.bg-surface-950-50{background-color:light-dark(var(--color-surface-950),var(--color-surface-50))}.bg-warning-500{background-color:var(--color-warning-500)}.bg-white{background-color:var(--color-white)}.bg-yellow-200{background-color:var(--color-yellow-200)}.preset-tonal{background-color:color-mix(in oklab,light-dark(var(--color-surface-950),var(--color-surface-50))5%,transparent)}.fill-none{fill:none}.fill-surface-950-50{fill:light-dark(var(--color-surface-950),var(--color-surface-50))}.stroke-primary-500{stroke:var(--color-primary-500)}.stroke-surface-200-800{stroke:light-dark(var(--color-surface-200),var(--color-surface-800))}.object-cover{-o-object-fit:cover;object-fit:cover}.p-0{padding:calc(var(--spacing)*0)}.p-0\\.5{padding:calc(var(--spacing)*.5)}.p-1{padding:calc(var(--spacing)*1)}.p-2{padding:calc(var(--spacing)*2)}.p-3{padding:calc(var(--spacing)*3)}.p-4{padding:calc(var(--spacing)*4)}.p-6{padding:calc(var(--spacing)*6)}.px-1{padding-inline:calc(var(--spacing)*1)}.px-3{padding-inline:calc(var(--spacing)*3)}.px-4{padding-inline:calc(var(--spacing)*4)}.py-2{padding-block:calc(var(--spacing)*2)}.py-3{padding-block:calc(var(--spacing)*3)}.py-10{padding-block:calc(var(--spacing)*10)}.pb-2{padding-bottom:calc(var(--spacing)*2)}.pl-4{padding-left:calc(var(--spacing)*4)}.text-center{text-align:center}.text-left{text-align:left}.text-right{text-align:right}.text-start{text-align:start}.align-sub{vertical-align:sub}.align-super{vertical-align:super}.anchor{color:var(--anchor-font-color);font-family:var(--anchor-font-family);font-size:var(--anchor-font-size);line-height:var(--anchor-line-height);font-weight:var(--anchor-font-weight);font-style:var(--anchor-font-style);letter-spacing:var(--anchor-letter-spacing);-webkit-text-decoration:var(--anchor-text-decoration);text-decoration:var(--anchor-text-decoration)}@media (hover:hover){.anchor:hover{-webkit-text-decoration:var(--anchor-text-decoration-hover);text-decoration:var(--anchor-text-decoration-hover)}}.anchor:active{-webkit-text-decoration:var(--anchor-text-decoration-active);text-decoration:var(--anchor-text-decoration-active)}.anchor:focus{-webkit-text-decoration:var(--anchor-text-decoration-focus);text-decoration:var(--anchor-text-decoration-focus)}@media (prefers-color-scheme:dark){.anchor{color:var(--anchor-font-color-dark)}}.h1{color:var(--heading-font-color);font-family:var(--heading-font-family);font-weight:var(--heading-font-weight);font-style:var(--heading-font-style);letter-spacing:var(--heading-letter-spacing);font-size:var(--text-4xl);line-height:var(--text-4xl--line-height)}@media (width>=48rem){.h1{font-size:var(--text-5xl);line-height:var(--text-5xl--line-height)}}@media (prefers-color-scheme:dark){.h1{color:var(--heading-font-color-dark)}}.h2{color:var(--heading-font-color);font-family:var(--heading-font-family);font-weight:var(--heading-font-weight);font-style:var(--heading-font-style);letter-spacing:var(--heading-letter-spacing);font-size:var(--text-3xl);line-height:var(--text-3xl--line-height)}@media (width>=48rem){.h2{font-size:var(--text-4xl);line-height:var(--text-4xl--line-height)}}@media (prefers-color-scheme:dark){.h2{color:var(--heading-font-color-dark)}}.h3{color:var(--heading-font-color);font-family:var(--heading-font-family);font-weight:var(--heading-font-weight);font-style:var(--heading-font-style);letter-spacing:var(--heading-letter-spacing);font-size:var(--text-2xl);line-height:var(--text-2xl--line-height)}@media (width>=48rem){.h3{font-size:var(--text-3xl);line-height:var(--text-3xl--line-height)}}@media (prefers-color-scheme:dark){.h3{color:var(--heading-font-color-dark)}}.h4{color:var(--heading-font-color);font-family:var(--heading-font-family);font-weight:var(--heading-font-weight);font-style:var(--heading-font-style);letter-spacing:var(--heading-letter-spacing);font-size:var(--text-xl);line-height:var(--text-xl--line-height)}@media (width>=48rem){.h4{font-size:var(--text-2xl);line-height:var(--text-2xl--line-height)}}@media (prefers-color-scheme:dark){.h4{color:var(--heading-font-color-dark)}}.h5{color:var(--heading-font-color);font-family:var(--heading-font-family);font-weight:var(--heading-font-weight);font-style:var(--heading-font-style);letter-spacing:var(--heading-letter-spacing);font-size:var(--text-lg);line-height:var(--text-lg--line-height)}@media (width>=48rem){.h5{font-size:var(--text-xl);line-height:var(--text-xl--line-height)}}@media (prefers-color-scheme:dark){.h5{color:var(--heading-font-color-dark)}}.h6{color:var(--heading-font-color);font-family:var(--heading-font-family);font-weight:var(--heading-font-weight);font-style:var(--heading-font-style);letter-spacing:var(--heading-letter-spacing);font-size:var(--text-base);line-height:var(--text-base--line-height)}@media (width>=48rem){.h6{font-size:var(--text-lg);line-height:var(--text-lg--line-height)}}@media (prefers-color-scheme:dark){.h6{color:var(--heading-font-color-dark)}}.font-mono{font-family:var(--font-mono)}.text-2xl{font-size:calc(1.5rem*var(--text-scaling));line-height:var(--tw-leading,calc(calc(2/1.5)*var(--text-scaling)))}.text-3xl{font-size:calc(1.875rem*var(--text-scaling));line-height:var(--tw-leading,calc( 1.2 *var(--text-scaling)))}.text-4xl{font-size:calc(2.25rem*var(--text-scaling));line-height:var(--tw-leading,calc(calc(2.5/2.25)*var(--text-scaling)))}.text-base{font-size:calc(1rem*var(--text-scaling));line-height:var(--tw-leading,calc( 1.5 *var(--text-scaling)))}.text-lg{font-size:calc(1.125rem*var(--text-scaling));line-height:var(--tw-leading,calc(calc(1.75/1.125)*var(--text-scaling)))}.text-sm{font-size:calc(.875rem*var(--text-scaling));line-height:var(--tw-leading,calc(calc(1.25/.875)*var(--text-scaling)))}.text-xl{font-size:calc(1.25rem*var(--text-scaling));line-height:var(--tw-leading,calc(calc(1.75/1.25)*var(--text-scaling)))}.text-xs{font-size:calc(.75rem*var(--text-scaling));line-height:var(--tw-leading,calc(calc(1/.75)*var(--text-scaling)))}.text-\\[10px\\]{font-size:10px}.leading-loose{--tw-leading:var(--leading-loose);line-height:var(--leading-loose)}.leading-normal{--tw-leading:var(--leading-normal);line-height:var(--leading-normal)}.leading-relaxed{--tw-leading:var(--leading-relaxed);line-height:var(--leading-relaxed)}.leading-snug{--tw-leading:var(--leading-snug);line-height:var(--leading-snug)}.leading-tight{--tw-leading:var(--leading-tight);line-height:var(--leading-tight)}.font-bold{--tw-font-weight:var(--font-weight-bold);font-weight:var(--font-weight-bold)}.font-medium{--tw-font-weight:var(--font-weight-medium);font-weight:var(--font-weight-medium)}.font-semibold{--tw-font-weight:var(--font-weight-semibold);font-weight:var(--font-weight-semibold)}.text-wrap{text-wrap:wrap}.whitespace-nowrap{white-space:nowrap}.text-blue-600{color:var(--color-blue-600)}.text-error-500{color:var(--color-error-500)}.text-gray-600{color:var(--color-gray-600)}.text-gray-700{color:var(--color-gray-700)}.text-green-600{color:var(--color-green-600)}.text-primary-500{color:var(--color-primary-500)}.text-red-700{color:var(--color-red-700)}.text-surface-400{color:var(--color-surface-400)}.text-surface-contrast-50{color:var(--color-surface-contrast-50)}.text-surface-contrast-950{color:var(--color-surface-contrast-950)}.text-white{color:var(--color-white)}.italic{font-style:italic}.line-through{text-decoration-line:line-through}.underline{text-decoration-line:underline}.opacity-50{opacity:.5}.opacity-60{opacity:.6}.opacity-100{opacity:1}.shadow{--tw-shadow:0 1px 3px 0 var(--tw-shadow-color,#0000001a),0 1px 2px -1px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.shadow-lg{--tw-shadow:0 10px 15px -3px var(--tw-shadow-color,#0000001a),0 4px 6px -4px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.shadow-xl{--tw-shadow:0 20px 25px -5px var(--tw-shadow-color,#0000001a),0 8px 10px -6px var(--tw-shadow-color,#0000001a);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.ring-2{--tw-ring-shadow:var(--tw-ring-inset,)0 0 0 calc(2px + var(--tw-ring-offset-width))var(--tw-ring-color,currentColor);box-shadow:var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)}.ring-surface-950-50{--tw-ring-color:light-dark(var(--color-surface-950),var(--color-surface-50))}.blur{--tw-blur:blur(8px);filter:var(--tw-blur,)var(--tw-brightness,)var(--tw-contrast,)var(--tw-grayscale,)var(--tw-hue-rotate,)var(--tw-invert,)var(--tw-saturate,)var(--tw-sepia,)var(--tw-drop-shadow,)}.filter{filter:var(--tw-blur,)var(--tw-brightness,)var(--tw-contrast,)var(--tw-grayscale,)var(--tw-hue-rotate,)var(--tw-invert,)var(--tw-saturate,)var(--tw-sepia,)var(--tw-drop-shadow,)}.backdrop-blur-sm{--tw-backdrop-blur:blur(var(--blur-sm));-webkit-backdrop-filter:var(--tw-backdrop-blur,)var(--tw-backdrop-brightness,)var(--tw-backdrop-contrast,)var(--tw-backdrop-grayscale,)var(--tw-backdrop-hue-rotate,)var(--tw-backdrop-invert,)var(--tw-backdrop-opacity,)var(--tw-backdrop-saturate,)var(--tw-backdrop-sepia,);backdrop-filter:var(--tw-backdrop-blur,)var(--tw-backdrop-brightness,)var(--tw-backdrop-contrast,)var(--tw-backdrop-grayscale,)var(--tw-backdrop-hue-rotate,)var(--tw-backdrop-invert,)var(--tw-backdrop-opacity,)var(--tw-backdrop-saturate,)var(--tw-backdrop-sepia,)}.transition{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to,opacity,box-shadow,transform,translate,scale,rotate,filter,-webkit-backdrop-filter,backdrop-filter;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[stroke-dashoffset\\]{transition-property:stroke-dashoffset;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-\\[width\\]{transition-property:width;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-all{transition-property:all;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-colors{transition-property:color,background-color,border-color,outline-color,text-decoration-color,fill,stroke,--tw-gradient-from,--tw-gradient-via,--tw-gradient-to;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.transition-opacity{transition-property:opacity;transition-timing-function:var(--tw-ease,var(--default-transition-timing-function));transition-duration:var(--tw-duration,var(--default-transition-duration))}.duration-100{--tw-duration:.1s;transition-duration:.1s}.duration-200{--tw-duration:.2s;transition-duration:.2s}.duration-300{--tw-duration:.3s;transition-duration:.3s}.duration-500{--tw-duration:.5s;transition-duration:.5s}.ease-in-out{--tw-ease:var(--ease-in-out);transition-timing-function:var(--ease-in-out)}.ring-inset{--tw-ring-inset:inset}@media (hover:hover){.hover\\:cursor-pointer:hover{cursor:pointer}.hover\\:preset-filled:hover{background-color:var(--color-surface-950-50);color:var(--color-surface-50-950)}.hover\\:preset-filled-surface-50-950:hover{color:var(--color-surface-contrast-50-950);background-color:var(--color-surface-50-950)}.hover\\:preset-tonal-primary:hover{background-color:var(--color-primary-50-950);color:var(--color-primary-950-50)}.hover\\:preset-tonal:hover{background-color:color-mix(in oklab,light-dark(var(--color-surface-950),var(--color-surface-50))5%,transparent)}.hover\\:text-blue-800:hover{color:var(--color-blue-800)}.hover\\:brightness-90:hover{--tw-brightness:brightness(90%);filter:var(--tw-blur,)var(--tw-brightness,)var(--tw-contrast,)var(--tw-grayscale,)var(--tw-hue-rotate,)var(--tw-invert,)var(--tw-saturate,)var(--tw-sepia,)var(--tw-drop-shadow,)}}@media (width>=48rem){.md\\:size-5{width:calc(var(--spacing)*5);height:calc(var(--spacing)*5)}}.rtl\\:-translate-x-4:where(:dir(rtl),[dir=rtl],[dir=rtl] *){--tw-translate-x:calc(var(--spacing)*-4);translate:var(--tw-translate-x)var(--tw-translate-y)}.rtl\\:grid-cols-\\[1fr_auto_auto\\]:where(:dir(rtl),[dir=rtl],[dir=rtl] *){grid-template-columns:1fr auto auto}:where(.rtl\\:space-x-reverse:where(:dir(rtl),[dir=rtl],[dir=rtl] *)>:not(:last-child)){--tw-space-x-reverse:1}@media (prefers-color-scheme:dark){.dark\\:\\!bg-surface-800{background-color:var(--color-surface-800)!important}.dark\\:bg-surface-950\\/75{background-color:color-mix(in oklab,var(--color-surface-950)75%,transparent)}.dark\\:text-surface-contrast-50{color:var(--color-surface-contrast-50)}@media (hover:hover){.dark\\:hover\\:brightness-110:hover{--tw-brightness:brightness(110%);filter:var(--tw-blur,)var(--tw-brightness,)var(--tw-contrast,)var(--tw-grayscale,)var(--tw-hue-rotate,)var(--tw-invert,)var(--tw-saturate,)var(--tw-sepia,)var(--tw-drop-shadow,)}}}.\\[\\&\\:not\\(\\:hover\\)\\]\\:opacity-50:not(:hover){opacity:.5}.\\[\\&\\>pre\\]\\:p-4>pre{padding:calc(var(--spacing)*4)}}@keyframes anim-progress-indeterminate{0%{transform:translate(-200%)}to{transform:translate(200%)}}@keyframes anim-ring-indeterminate{0%{stroke-dasharray:1 400;stroke-dashoffset:0}to{stroke-dasharray:400 400;stroke-dashoffset:-140px}}[data-theme=crimson]{--text-scaling:1.067;--base-font-color:var(--color-surface-950);--base-font-color-dark:var(--color-surface-50);--base-font-family:Avenir,Montserrat,Corbel,"URW Gothic",source-sans-pro,sans-serif;--base-font-size:inherit;--base-line-height:inherit;--base-font-weight:normal;--base-font-style:normal;--base-letter-spacing:0em;--heading-font-color:inherit;--heading-font-color-dark:inherit;--heading-font-family:Avenir,Montserrat,Corbel,"URW Gothic",source-sans-pro,sans-serif;--heading-font-weight:normal;--heading-font-style:normal;--heading-letter-spacing:inherit;--anchor-font-color:var(--color-primary-500);--anchor-font-color-dark:var(--color-primary-500);--anchor-font-family:inherit;--anchor-font-size:inherit;--anchor-line-height:inherit;--anchor-font-weight:inherit;--anchor-font-style:inherit;--anchor-letter-spacing:inherit;--anchor-text-decoration:none;--anchor-text-decoration-hover:underline;--anchor-text-decoration-active:none;--anchor-text-decoration-focus:none;--spacing:.25rem;--radius-base:.375rem;--radius-container:.75rem;--default-border-width:1px;--default-divide-width:1px;--default-ring-width:1px;--body-background-color:255 255 255;--body-background-color-dark:var(--color-surface-950);--color-primary-50:oklch(88.86% .05 4.44);--color-primary-100:oklch(80.66% .09 5.94);--color-primary-200:oklch(72.91% .13 8.14);--color-primary-300:oklch(65.86% .17 10.24);--color-primary-400:oklch(59.91% .2 14.19);--color-primary-500:oklch(55.71% .21 19.55);--color-primary-600:oklch(50.91% .2 19.59);--color-primary-700:oklch(46.18% .18 19.26);--color-primary-800:oklch(41.14% .16 19.25);--color-primary-900:oklch(36.08% .14 18.61);--color-primary-950:oklch(30.55% .12 17.97);--color-primary-contrast-dark:var(--color-primary-950);--color-primary-contrast-light:var(--color-primary-50);--color-primary-contrast-50:var(--color-primary-contrast-dark);--color-primary-contrast-100:var(--color-primary-contrast-dark);--color-primary-contrast-200:var(--color-primary-contrast-dark);--color-primary-contrast-300:var(--color-primary-contrast-dark);--color-primary-contrast-400:var(--color-primary-contrast-dark);--color-primary-contrast-500:var(--color-primary-contrast-light);--color-primary-contrast-600:var(--color-primary-contrast-light);--color-primary-contrast-700:var(--color-primary-contrast-light);--color-primary-contrast-800:var(--color-primary-contrast-light);--color-primary-contrast-900:var(--color-primary-contrast-light);--color-primary-contrast-950:var(--color-primary-contrast-light);--color-secondary-50:oklch(92.56% .03 231.59);--color-secondary-100:oklch(86.02% .04 233.6);--color-secondary-200:oklch(79.42% .05 234.87);--color-secondary-300:oklch(72.61% .07 238);--color-secondary-400:oklch(65.93% .08 238.76);--color-secondary-500:oklch(59.26% .09 239.95);--color-secondary-600:oklch(54.31% .08 239.27);--color-secondary-700:oklch(49.31% .08 239.24);--color-secondary-800:oklch(43.86% .07 239.73);--color-secondary-900:oklch(38.56% .06 239.77);--color-secondary-950:oklch(33.02% .05 238.49);--color-secondary-contrast-dark:var(--color-secondary-950);--color-secondary-contrast-light:var(--color-secondary-50);--color-secondary-contrast-50:var(--color-secondary-contrast-dark);--color-secondary-contrast-100:var(--color-secondary-contrast-dark);--color-secondary-contrast-200:var(--color-secondary-contrast-dark);--color-secondary-contrast-300:var(--color-secondary-contrast-dark);--color-secondary-contrast-400:var(--color-secondary-contrast-dark);--color-secondary-contrast-500:var(--color-secondary-contrast-light);--color-secondary-contrast-600:var(--color-secondary-contrast-light);--color-secondary-contrast-700:var(--color-secondary-contrast-light);--color-secondary-contrast-800:var(--color-secondary-contrast-light);--color-secondary-contrast-900:var(--color-secondary-contrast-light);--color-secondary-contrast-950:var(--color-secondary-contrast-light);--color-tertiary-50:oklch(96.87% 0 18.01);--color-tertiary-100:oklch(95.67% 0 18);--color-tertiary-200:oklch(94.74% 0 49.04);--color-tertiary-300:oklch(91.56% 0 34.58);--color-tertiary-400:oklch(85.05% .01 27.4);--color-tertiary-500:oklch(78.4% .01 31.17);--color-tertiary-600:oklch(72.57% .01 32.61);--color-tertiary-700:oklch(63.56% .01 36.62);--color-tertiary-800:oklch(53.99% .01 28.97);--color-tertiary-900:oklch(46.84% .01 31.17);--color-tertiary-950:oklch(43.57% .01 31.17);--color-tertiary-contrast-dark:var(--color-tertiary-950);--color-tertiary-contrast-light:var(--color-tertiary-50);--color-tertiary-contrast-50:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-100:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-200:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-300:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-400:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-500:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-600:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-700:var(--color-tertiary-contrast-light);--color-tertiary-contrast-800:var(--color-tertiary-contrast-light);--color-tertiary-contrast-900:var(--color-tertiary-contrast-light);--color-tertiary-contrast-950:var(--color-tertiary-contrast-light);--color-success-50:oklch(97.91% .02 122.93);--color-success-100:oklch(97.16% .02 122.74);--color-success-200:oklch(96.6% .02 124.19);--color-success-300:oklch(94.25% .04 124.61);--color-success-400:oklch(90.14% .07 124.95);--color-success-500:oklch(86% .1 126.06);--color-success-600:oklch(79.54% .09 125.92);--color-success-700:oklch(69.53% .08 125.89);--color-success-800:oklch(59.17% .06 126.17);--color-success-900:oklch(51.08% .05 125.23);--color-success-950:oklch(47.93% .05 125.78);--color-success-contrast-dark:var(--color-success-950);--color-success-contrast-light:var(--color-success-50);--color-success-contrast-50:var(--color-success-contrast-dark);--color-success-contrast-100:var(--color-success-contrast-dark);--color-success-contrast-200:var(--color-success-contrast-dark);--color-success-contrast-300:var(--color-success-contrast-dark);--color-success-contrast-400:var(--color-success-contrast-dark);--color-success-contrast-500:var(--color-success-contrast-dark);--color-success-contrast-600:var(--color-success-contrast-dark);--color-success-contrast-700:var(--color-success-contrast-light);--color-success-contrast-800:var(--color-success-contrast-light);--color-success-contrast-900:var(--color-success-contrast-light);--color-success-contrast-950:var(--color-success-contrast-light);--color-warning-50:oklch(97.3% .02 91.54);--color-warning-100:oklch(96.43% .03 90.88);--color-warning-200:oklch(95.48% .03 92.24);--color-warning-300:oklch(92.83% .05 92.14);--color-warning-400:oklch(87.41% .09 91.27);--color-warning-500:oklch(82.4% .13 90.68);--color-warning-600:oklch(76.24% .11 91.06);--color-warning-700:oklch(66.71% .1 91.1);--color-warning-800:oklch(56.58% .08 90.28);--color-warning-900:oklch(49.1% .07 90.52);--color-warning-950:oklch(45.94% .07 89.94);--color-warning-contrast-dark:var(--color-warning-950);--color-warning-contrast-light:var(--color-warning-50);--color-warning-contrast-50:var(--color-warning-contrast-dark);--color-warning-contrast-100:var(--color-warning-contrast-dark);--color-warning-contrast-200:var(--color-warning-contrast-dark);--color-warning-contrast-300:var(--color-warning-contrast-dark);--color-warning-contrast-400:var(--color-warning-contrast-dark);--color-warning-contrast-500:var(--color-warning-contrast-dark);--color-warning-contrast-600:var(--color-warning-contrast-dark);--color-warning-contrast-700:var(--color-warning-contrast-light);--color-warning-contrast-800:var(--color-warning-contrast-light);--color-warning-contrast-900:var(--color-warning-contrast-light);--color-warning-contrast-950:var(--color-warning-contrast-light);--color-error-50:oklch(95.25% .01 17.52);--color-error-100:oklch(93.57% .02 13.48);--color-error-200:oklch(92.09% .02 14.35);--color-error-300:oklch(87.34% .04 15.86);--color-error-400:oklch(77.78% .07 16.56);--color-error-500:oklch(68.53% .1 18.56);--color-error-600:oklch(63.39% .1 18.38);--color-error-700:oklch(55.64% .08 18.02);--color-error-800:oklch(47.45% .07 18.65);--color-error-900:oklch(41.28% .06 18.29);--color-error-950:oklch(38.24% .06 18.5);--color-error-contrast-dark:var(--color-error-950);--color-error-contrast-light:var(--color-error-50);--color-error-contrast-50:var(--color-error-contrast-dark);--color-error-contrast-100:var(--color-error-contrast-dark);--color-error-contrast-200:var(--color-error-contrast-dark);--color-error-contrast-300:var(--color-error-contrast-dark);--color-error-contrast-400:var(--color-error-contrast-dark);--color-error-contrast-500:var(--color-error-contrast-dark);--color-error-contrast-600:var(--color-error-contrast-light);--color-error-contrast-700:var(--color-error-contrast-light);--color-error-contrast-800:var(--color-error-contrast-light);--color-error-contrast-900:var(--color-error-contrast-light);--color-error-contrast-950:var(--color-error-contrast-light);--color-surface-50:oklch(90.65% 0 264.68);--color-surface-100:oklch(80.46% .01 268.6);--color-surface-200:oklch(69.96% .01 271.26);--color-surface-300:oklch(58.9% .02 278.84);--color-surface-400:oklch(47.48% .03 277.42);--color-surface-500:oklch(35.33% .04 275.68);--color-surface-600:oklch(31.82% .03 277.05);--color-surface-700:oklch(28.12% .03 276.09);--color-surface-800:oklch(24.72% .03 274.9);--color-surface-900:oklch(20.75% .02 273.29);--color-surface-950:oklch(16.69% .02 275.16);--color-surface-contrast-dark:var(--color-surface-950);--color-surface-contrast-light:var(--color-surface-50);--color-surface-contrast-50:var(--color-surface-contrast-dark);--color-surface-contrast-100:var(--color-surface-contrast-dark);--color-surface-contrast-200:var(--color-surface-contrast-dark);--color-surface-contrast-300:var(--color-surface-contrast-dark);--color-surface-contrast-400:var(--color-surface-contrast-light);--color-surface-contrast-500:var(--color-surface-contrast-light);--color-surface-contrast-600:var(--color-surface-contrast-light);--color-surface-contrast-700:var(--color-surface-contrast-light);--color-surface-contrast-800:var(--color-surface-contrast-light);--color-surface-contrast-900:var(--color-surface-contrast-light);--color-surface-contrast-950:var(--color-surface-contrast-light)}[data-theme=vintage]{--text-scaling:1.067;--base-font-color:var(--color-surface-950);--base-font-color-dark:var(--color-surface-50);--base-font-family:Avenir,Montserrat,Corbel,"URW Gothic",source-sans-pro,sans-serif;--base-font-size:inherit;--base-line-height:inherit;--base-font-weight:normal;--base-font-style:normal;--base-letter-spacing:0em;--heading-font-color:var(--color-secondary-950);--heading-font-color-dark:255 255 255;--heading-font-family:Optima,Candara,"Noto Sans",source-sans-pro,sans-serif;--heading-font-weight:bold;--heading-font-style:normal;--heading-letter-spacing:inherit;--anchor-font-color:var(--color-primary-600);--anchor-font-color-dark:var(--color-primary-500);--anchor-font-family:inherit;--anchor-font-size:inherit;--anchor-line-height:inherit;--anchor-font-weight:inherit;--anchor-font-style:inherit;--anchor-letter-spacing:inherit;--anchor-text-decoration:none;--anchor-text-decoration-hover:underline;--anchor-text-decoration-active:none;--anchor-text-decoration-focus:none;--spacing:.25rem;--radius-base:.375rem;--radius-container:.75rem;--default-border-width:1px;--default-divide-width:1px;--default-ring-width:1px;--body-background-color:var(--color-surface-50);--body-background-color-dark:var(--color-surface-950);--color-primary-50:oklch(95.02% .11 100.34);--color-primary-100:oklch(90.13% .12 91.31);--color-primary-200:oklch(85.12% .13 82.4);--color-primary-300:oklch(80.35% .14 75.05);--color-primary-400:oklch(75.65% .15 67.11);--color-primary-500:oklch(71.39% .16 59.66);--color-primary-600:oklch(63.94% .15 55.68);--color-primary-700:oklch(56.65% .14 51.28);--color-primary-800:oklch(48.89% .13 46.01);--color-primary-900:oklch(41.32% .12 40.46);--color-primary-950:oklch(33.41% .12 35.2);--color-primary-contrast-dark:var(--color-primary-950);--color-primary-contrast-light:var(--color-primary-50);--color-primary-contrast-50:var(--color-primary-contrast-dark);--color-primary-contrast-100:var(--color-primary-contrast-dark);--color-primary-contrast-200:var(--color-primary-contrast-dark);--color-primary-contrast-300:var(--color-primary-contrast-dark);--color-primary-contrast-400:var(--color-primary-contrast-dark);--color-primary-contrast-500:var(--color-primary-contrast-dark);--color-primary-contrast-600:var(--color-primary-contrast-dark);--color-primary-contrast-700:var(--color-primary-contrast-light);--color-primary-contrast-800:var(--color-primary-contrast-light);--color-primary-contrast-900:var(--color-primary-contrast-light);--color-primary-contrast-950:var(--color-primary-contrast-light);--color-secondary-50:oklch(98.29% .02 167.04);--color-secondary-100:oklch(94.64% .03 161.36);--color-secondary-200:oklch(90.98% .05 158.22);--color-secondary-300:oklch(87.56% .06 154.22);--color-secondary-400:oklch(83.89% .07 153.08);--color-secondary-500:oklch(80.21% .08 152.14);--color-secondary-600:oklch(72.77% .08 152.75);--color-secondary-700:oklch(65.39% .08 153.08);--color-secondary-800:oklch(57.56% .08 152.84);--color-secondary-900:oklch(49.78% .08 152.82);--color-secondary-950:oklch(41.49% .08 152.66);--color-secondary-contrast-dark:var(--color-secondary-950);--color-secondary-contrast-light:var(--color-secondary-50);--color-secondary-contrast-50:var(--color-secondary-contrast-dark);--color-secondary-contrast-100:var(--color-secondary-contrast-dark);--color-secondary-contrast-200:var(--color-secondary-contrast-dark);--color-secondary-contrast-300:var(--color-secondary-contrast-dark);--color-secondary-contrast-400:var(--color-secondary-contrast-dark);--color-secondary-contrast-500:var(--color-secondary-contrast-dark);--color-secondary-contrast-600:var(--color-secondary-contrast-dark);--color-secondary-contrast-700:var(--color-secondary-contrast-light);--color-secondary-contrast-800:var(--color-secondary-contrast-light);--color-secondary-contrast-900:var(--color-secondary-contrast-light);--color-secondary-contrast-950:var(--color-secondary-contrast-light);--color-tertiary-50:oklch(96.23% .03 211.02);--color-tertiary-100:oklch(90.57% .06 208.83);--color-tertiary-200:oklch(85.08% .09 210.4);--color-tertiary-300:oklch(80.11% .11 210.36);--color-tertiary-400:oklch(75.45% .12 212.87);--color-tertiary-500:oklch(71.48% .13 215.21);--color-tertiary-600:oklch(64.8% .12 216.99);--color-tertiary-700:oklch(57.99% .1 220);--color-tertiary-800:oklch(50.93% .09 222.96);--color-tertiary-900:oklch(43.67% .08 227.87);--color-tertiary-950:oklch(36.04% .07 233.37);--color-tertiary-contrast-dark:var(--color-tertiary-950);--color-tertiary-contrast-light:var(--color-tertiary-50);--color-tertiary-contrast-50:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-100:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-200:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-300:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-400:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-500:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-600:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-700:var(--color-tertiary-contrast-light);--color-tertiary-contrast-800:var(--color-tertiary-contrast-light);--color-tertiary-contrast-900:var(--color-tertiary-contrast-light);--color-tertiary-contrast-950:var(--color-tertiary-contrast-light);--color-success-50:oklch(99.02% .05 107.26);--color-success-100:oklch(94.56% .07 120.38);--color-success-200:oklch(90.03% .09 126.59);--color-success-300:oklch(85.68% .12 131);--color-success-400:oklch(81.26% .14 133.59);--color-success-500:oklch(77.09% .16 135.74);--color-success-600:oklch(69.58% .16 137.26);--color-success-700:oklch(61.89% .15 139.14);--color-success-800:oklch(54.4% .15 140.58);--color-success-900:oklch(46.54% .14 141.99);--color-success-950:oklch(38.63% .13 142.5);--color-success-contrast-dark:var(--color-success-950);--color-success-contrast-light:var(--color-success-50);--color-success-contrast-50:var(--color-success-contrast-dark);--color-success-contrast-100:var(--color-success-contrast-dark);--color-success-contrast-200:var(--color-success-contrast-dark);--color-success-contrast-300:var(--color-success-contrast-dark);--color-success-contrast-400:var(--color-success-contrast-dark);--color-success-contrast-500:var(--color-success-contrast-dark);--color-success-contrast-600:var(--color-success-contrast-dark);--color-success-contrast-700:var(--color-success-contrast-light);--color-success-contrast-800:var(--color-success-contrast-light);--color-success-contrast-900:var(--color-success-contrast-light);--color-success-contrast-950:var(--color-success-contrast-light);--color-warning-50:oklch(98.02% .11 108.28);--color-warning-100:oklch(94.96% .13 104.16);--color-warning-200:oklch(92.23% .14 100.87);--color-warning-300:oklch(89.3% .15 97.77);--color-warning-400:oklch(86.71% .16 94.79);--color-warning-500:oklch(83.92% .17 91.31);--color-warning-600:oklch(75.81% .15 88.7);--color-warning-700:oklch(67.4% .13 84.01);--color-warning-800:oklch(58.84% .12 79.18);--color-warning-900:oklch(49.95% .11 70.85);--color-warning-950:oklch(40.82% .09 62.01);--color-warning-contrast-dark:var(--color-warning-950);--color-warning-contrast-light:var(--color-warning-50);--color-warning-contrast-50:var(--color-warning-contrast-dark);--color-warning-contrast-100:var(--color-warning-contrast-dark);--color-warning-contrast-200:var(--color-warning-contrast-dark);--color-warning-contrast-300:var(--color-warning-contrast-dark);--color-warning-contrast-400:var(--color-warning-contrast-dark);--color-warning-contrast-500:var(--color-warning-contrast-dark);--color-warning-contrast-600:var(--color-warning-contrast-dark);--color-warning-contrast-700:var(--color-warning-contrast-dark);--color-warning-contrast-800:var(--color-warning-contrast-light);--color-warning-contrast-900:var(--color-warning-contrast-light);--color-warning-contrast-950:var(--color-warning-contrast-light);--color-error-50:oklch(92.64% .04 45.08);--color-error-100:oklch(87.88% .05 37.49);--color-error-200:oklch(82.85% .06 31.65);--color-error-300:oklch(78.14% .08 27.84);--color-error-400:oklch(73.15% .09 25.37);--color-error-500:oklch(68.52% .11 24.52);--color-error-600:oklch(61.02% .11 22.91);--color-error-700:oklch(53.36% .11 22.82);--color-error-800:oklch(45.55% .11 21.61);--color-error-900:oklch(37.58% .11 22.3);--color-error-950:oklch(29.76% .1 23.16);--color-error-contrast-dark:var(--color-error-950);--color-error-contrast-light:var(--color-error-50);--color-error-contrast-50:var(--color-error-contrast-dark);--color-error-contrast-100:var(--color-error-contrast-dark);--color-error-contrast-200:var(--color-error-contrast-dark);--color-error-contrast-300:var(--color-error-contrast-dark);--color-error-contrast-400:var(--color-error-contrast-dark);--color-error-contrast-500:var(--color-error-contrast-dark);--color-error-contrast-600:var(--color-error-contrast-dark);--color-error-contrast-700:var(--color-error-contrast-light);--color-error-contrast-800:var(--color-error-contrast-light);--color-error-contrast-900:var(--color-error-contrast-light);--color-error-contrast-950:var(--color-error-contrast-light);--color-surface-50:oklch(91.65% 0 78.25);--color-surface-100:oklch(81.22% .01 75.38);--color-surface-200:oklch(70.23% .01 61.43);--color-surface-300:oklch(58.92% .01 67.64);--color-surface-400:oklch(46.9% .01 58.02);--color-surface-500:oklch(34.32% .02 59.12);--color-surface-600:oklch(31.5% .01 57.78);--color-surface-700:oklch(28.58% .01 62.11);--color-surface-800:oklch(25.73% .01 55.81);--color-surface-900:oklch(22.65% .01 60.89);--color-surface-950:oklch(19.49% .01 59.11);--color-surface-contrast-dark:var(--color-surface-950);--color-surface-contrast-light:var(--color-surface-50);--color-surface-contrast-50:var(--color-surface-contrast-dark);--color-surface-contrast-100:var(--color-surface-contrast-dark);--color-surface-contrast-200:var(--color-surface-contrast-dark);--color-surface-contrast-300:var(--color-surface-contrast-dark);--color-surface-contrast-400:var(--color-surface-contrast-light);--color-surface-contrast-500:var(--color-surface-contrast-light);--color-surface-contrast-600:var(--color-surface-contrast-light);--color-surface-contrast-700:var(--color-surface-contrast-light);--color-surface-contrast-800:var(--color-surface-contrast-light);--color-surface-contrast-900:var(--color-surface-contrast-light);--color-surface-contrast-950:var(--color-surface-contrast-light)}[data-theme=sahara]{--text-scaling:1.067;--base-font-color:var(--color-surface-950);--base-font-color-dark:var(--color-surface-50);--base-font-family:Seravek,"Gill Sans Nova",Ubuntu,Calibri,"DejaVu Sans",source-sans-pro,sans-serif;--base-font-size:inherit;--base-line-height:inherit;--base-font-weight:normal;--base-font-style:normal;--base-letter-spacing:.025em;--heading-font-color:inherit;--heading-font-color-dark:inherit;--heading-font-family:Superclarendon,"Bookman Old Style","URW Bookman","URW Bookman L","Georgia Pro",Georgia,serif;--heading-font-weight:normal;--heading-font-style:normal;--heading-letter-spacing:inherit;--anchor-font-color:var(--color-tertiary-800);--anchor-font-color-dark:var(--color-primary-500);--anchor-font-family:inherit;--anchor-font-size:inherit;--anchor-line-height:inherit;--anchor-font-weight:inherit;--anchor-font-style:inherit;--anchor-letter-spacing:inherit;--anchor-text-decoration:none;--anchor-text-decoration-hover:underline;--anchor-text-decoration-active:none;--anchor-text-decoration-focus:none;--spacing:.25rem;--radius-base:.375rem;--radius-container:.75rem;--default-border-width:1px;--default-divide-width:1px;--default-ring-width:1px;--body-background-color:var(--color-surface-50);--body-background-color-dark:var(--color-surface-950);--color-primary-50:oklch(91.62% .04 80.3);--color-primary-100:oklch(88.74% .07 80.84);--color-primary-200:oklch(85.97% .09 80.37);--color-primary-300:oklch(83.19% .11 80.38);--color-primary-400:oklch(80.63% .13 78.92);--color-primary-500:oklch(78.19% .15 76.87);--color-primary-600:oklch(74.03% .14 75.83);--color-primary-700:oklch(69.63% .13 73.95);--color-primary-800:oklch(65.34% .13 72.73);--color-primary-900:oklch(60.81% .12 70.35);--color-primary-950:oklch(56.39% .12 68.46);--color-primary-contrast-dark:oklch(0% 0 none);--color-primary-contrast-light:var(--color-primary-50);--color-primary-contrast-50:var(--color-primary-contrast-dark);--color-primary-contrast-100:var(--color-primary-contrast-dark);--color-primary-contrast-200:var(--color-primary-contrast-dark);--color-primary-contrast-300:var(--color-primary-contrast-dark);--color-primary-contrast-400:var(--color-primary-contrast-dark);--color-primary-contrast-500:var(--color-primary-contrast-dark);--color-primary-contrast-600:var(--color-primary-contrast-dark);--color-primary-contrast-700:var(--color-primary-contrast-light);--color-primary-contrast-800:var(--color-primary-contrast-light);--color-primary-contrast-900:var(--color-primary-contrast-light);--color-primary-contrast-950:var(--color-primary-contrast-light);--color-secondary-50:oklch(92.18% .03 194.04);--color-secondary-100:oklch(88.48% .05 190.34);--color-secondary-200:oklch(85.19% .08 187.46);--color-secondary-300:oklch(81.96% .09 186.93);--color-secondary-400:oklch(79.12% .11 184.89);--color-secondary-500:oklch(76.32% .12 183.49);--color-secondary-600:oklch(70.06% .11 183.71);--color-secondary-700:oklch(63.6% .1 183.21);--color-secondary-800:oklch(56.77% .09 184.29);--color-secondary-900:oklch(49.94% .08 183.71);--color-secondary-950:oklch(42.93% .07 184.14);--color-secondary-contrast-dark:var(--color-secondary-950);--color-secondary-contrast-light:var(--color-secondary-50);--color-secondary-contrast-50:var(--color-secondary-contrast-dark);--color-secondary-contrast-100:var(--color-secondary-contrast-dark);--color-secondary-contrast-200:var(--color-secondary-contrast-dark);--color-secondary-contrast-300:var(--color-secondary-contrast-dark);--color-secondary-contrast-400:var(--color-secondary-contrast-dark);--color-secondary-contrast-500:var(--color-secondary-contrast-dark);--color-secondary-contrast-600:var(--color-secondary-contrast-dark);--color-secondary-contrast-700:var(--color-secondary-contrast-light);--color-secondary-contrast-800:var(--color-secondary-contrast-light);--color-secondary-contrast-900:var(--color-secondary-contrast-light);--color-secondary-contrast-950:var(--color-secondary-contrast-light);--color-tertiary-50:oklch(92.13% .03 125.15);--color-tertiary-100:oklch(90.83% .05 125.1);--color-tertiary-200:oklch(89.46% .07 125.79);--color-tertiary-300:oklch(88.21% .09 125.93);--color-tertiary-400:oklch(86.91% .1 126.5);--color-tertiary-500:oklch(85.72% .12 126.76);--color-tertiary-600:oklch(78.44% .11 126.76);--color-tertiary-700:oklch(71.21% .1 127.12);--color-tertiary-800:oklch(63.6% .09 126.32);--color-tertiary-900:oklch(55.96% .08 126.72);--color-tertiary-950:oklch(47.78% .07 126.72);--color-tertiary-contrast-dark:var(--color-tertiary-950);--color-tertiary-contrast-light:var(--color-tertiary-50);--color-tertiary-contrast-50:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-100:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-200:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-300:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-400:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-500:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-600:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-700:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-800:var(--color-tertiary-contrast-light);--color-tertiary-contrast-900:var(--color-tertiary-contrast-light);--color-tertiary-contrast-950:var(--color-tertiary-contrast-light);--color-success-50:oklch(92.63% .03 122.63);--color-success-100:oklch(89.09% .07 124.91);--color-success-200:oklch(85.69% .12 126.01);--color-success-300:oklch(82.52% .15 127.33);--color-success-400:oklch(79.55% .19 128.82);--color-success-500:oklch(76.81% .2 130.85);--color-success-600:oklch(70.53% .19 130.9);--color-success-700:oklch(63.85% .17 130.77);--color-success-800:oklch(57.25% .15 130.83);--color-success-900:oklch(50.18% .13 130.59);--color-success-950:oklch(43.13% .12 130.51);--color-success-contrast-dark:var(--color-success-950);--color-success-contrast-light:var(--color-success-50);--color-success-contrast-50:var(--color-success-contrast-dark);--color-success-contrast-100:var(--color-success-contrast-dark);--color-success-contrast-200:var(--color-success-contrast-dark);--color-success-contrast-300:var(--color-success-contrast-dark);--color-success-contrast-400:var(--color-success-contrast-dark);--color-success-contrast-500:var(--color-success-contrast-dark);--color-success-contrast-600:var(--color-success-contrast-dark);--color-success-contrast-700:var(--color-success-contrast-light);--color-success-contrast-800:var(--color-success-contrast-light);--color-success-contrast-900:var(--color-success-contrast-light);--color-success-contrast-950:var(--color-success-contrast-light);--color-warning-50:oklch(93.26% .06 94.56);--color-warning-100:oklch(91.02% .07 93.19);--color-warning-200:oklch(88.78% .09 92.44);--color-warning-300:oklch(86.5% .1 92.21);--color-warning-400:oklch(84.33% .12 91.47);--color-warning-500:oklch(82.22% .13 90.47);--color-warning-600:oklch(75.44% .12 90.62);--color-warning-700:oklch(68.29% .11 90.16);--color-warning-800:oklch(61.07% .1 91.06);--color-warning-900:oklch(53.51% .08 90.51);--color-warning-950:oklch(45.9% .07 90.82);--color-warning-contrast-dark:var(--color-warning-950);--color-warning-contrast-light:var(--color-warning-50);--color-warning-contrast-50:var(--color-warning-contrast-dark);--color-warning-contrast-100:var(--color-warning-contrast-dark);--color-warning-contrast-200:var(--color-warning-contrast-dark);--color-warning-contrast-300:var(--color-warning-contrast-dark);--color-warning-contrast-400:var(--color-warning-contrast-dark);--color-warning-contrast-500:var(--color-warning-contrast-dark);--color-warning-contrast-600:var(--color-warning-contrast-dark);--color-warning-contrast-700:var(--color-warning-contrast-dark);--color-warning-contrast-800:var(--color-warning-contrast-light);--color-warning-contrast-900:var(--color-warning-contrast-light);--color-warning-contrast-950:var(--color-warning-contrast-light);--color-error-50:oklch(90.58% .04 348.92);--color-error-100:oklch(85.27% .06 348.16);--color-error-200:oklch(79.87% .09 348.8);--color-error-300:oklch(74.74% .12 349.03);--color-error-400:oklch(69.77% .15 350.31);--color-error-500:oklch(65.35% .17 351.55);--color-error-600:oklch(60.74% .17 351.86);--color-error-700:oklch(56.21% .16 352.52);--color-error-800:oklch(51.44% .15 353.56);--color-error-900:oklch(46.79% .15 354.57);--color-error-950:oklch(41.93% .14 355.49);--color-error-contrast-dark:var(--color-error-950);--color-error-contrast-light:var(--color-error-50);--color-error-contrast-50:var(--color-error-contrast-dark);--color-error-contrast-100:var(--color-error-contrast-dark);--color-error-contrast-200:var(--color-error-contrast-dark);--color-error-contrast-300:var(--color-error-contrast-dark);--color-error-contrast-400:var(--color-error-contrast-dark);--color-error-contrast-500:var(--color-error-contrast-dark);--color-error-contrast-600:var(--color-error-contrast-light);--color-error-contrast-700:var(--color-error-contrast-light);--color-error-contrast-800:var(--color-error-contrast-light);--color-error-contrast-900:var(--color-error-contrast-light);--color-error-contrast-950:var(--color-error-contrast-light);--color-surface-50:oklch(94.95% .02 2.38);--color-surface-100:oklch(87.73% .05 5.32);--color-surface-200:oklch(80.76% .08 7.18);--color-surface-300:oklch(73.91% .11 9.52);--color-surface-400:oklch(67.64% .15 11.53);--color-surface-500:oklch(61.92% .17 14.12);--color-surface-600:oklch(56.84% .16 14.16);--color-surface-700:oklch(51.79% .15 13.98);--color-surface-800:oklch(46.47% .13 14.02);--color-surface-900:oklch(41.14% .12 13.76);--color-surface-950:oklch(35.48% .1 13.78);--color-surface-contrast-dark:var(--color-surface-950);--color-surface-contrast-light:var(--color-surface-50);--color-surface-contrast-50:var(--color-surface-contrast-dark);--color-surface-contrast-100:var(--color-surface-contrast-dark);--color-surface-contrast-200:var(--color-surface-contrast-dark);--color-surface-contrast-300:var(--color-surface-contrast-dark);--color-surface-contrast-400:var(--color-surface-contrast-dark);--color-surface-contrast-500:var(--color-surface-contrast-light);--color-surface-contrast-600:var(--color-surface-contrast-light);--color-surface-contrast-700:var(--color-surface-contrast-light);--color-surface-contrast-800:var(--color-surface-contrast-light);--color-surface-contrast-900:var(--color-surface-contrast-light);--color-surface-contrast-950:var(--color-surface-contrast-light)}[data-theme=rocket]{--text-scaling:1.067;--base-font-color:var(--color-surface-950);--base-font-color-dark:var(--color-surface-50);--base-font-family:system-ui,sans-serif;--base-font-size:inherit;--base-line-height:inherit;--base-font-weight:normal;--base-font-style:normal;--base-letter-spacing:0em;--heading-font-color:inherit;--heading-font-color-dark:inherit;--heading-font-family:Bahnschrift,"DIN Alternate","Franklin Gothic Medium","Nimbus Sans Narrow",sans-serif-condensed,sans-serif;--heading-font-weight:lighter;--heading-font-style:normal;--heading-letter-spacing:inherit;--anchor-font-color:var(--color-primary-600);--anchor-font-color-dark:var(--color-primary-500);--anchor-font-family:inherit;--anchor-font-size:inherit;--anchor-line-height:inherit;--anchor-font-weight:inherit;--anchor-font-style:inherit;--anchor-letter-spacing:inherit;--anchor-text-decoration:none;--anchor-text-decoration-hover:underline;--anchor-text-decoration-active:none;--anchor-text-decoration-focus:none;--spacing:.25rem;--radius-base:.375rem;--radius-container:.75rem;--default-border-width:1px;--default-divide-width:1px;--default-ring-width:1px;--body-background-color:255 255 255;--body-background-color-dark:var(--color-surface-950);--color-primary-50:oklch(95.11% .03 211.57);--color-primary-100:oklch(89.65% .06 209.91);--color-primary-200:oklch(84.27% .08 209.95);--color-primary-300:oklch(79.6% .11 210.67);--color-primary-400:oklch(75.13% .12 212.31);--color-primary-500:oklch(71.48% .13 215.21);--color-primary-600:oklch(64.97% .11 214.79);--color-primary-700:oklch(58.04% .1 215.21);--color-primary-800:oklch(51.15% .09 214.62);--color-primary-900:oklch(43.76% .08 215.22);--color-primary-950:oklch(36.34% .06 214.48);--color-primary-contrast-dark:var(--color-primary-950);--color-primary-contrast-light:var(--color-primary-50);--color-primary-contrast-50:var(--color-primary-contrast-dark);--color-primary-contrast-100:var(--color-primary-contrast-dark);--color-primary-contrast-200:var(--color-primary-contrast-dark);--color-primary-contrast-300:var(--color-primary-contrast-dark);--color-primary-contrast-400:var(--color-primary-contrast-dark);--color-primary-contrast-500:var(--color-primary-contrast-dark);--color-primary-contrast-600:var(--color-primary-contrast-dark);--color-primary-contrast-700:var(--color-primary-contrast-light);--color-primary-contrast-800:var(--color-primary-contrast-light);--color-primary-contrast-900:var(--color-primary-contrast-light);--color-primary-contrast-950:var(--color-primary-contrast-light);--color-secondary-50:oklch(90.39% .04 262.14);--color-secondary-100:oklch(84.43% .07 261.23);--color-secondary-200:oklch(78.58% .1 261.05);--color-secondary-300:oklch(72.98% .13 259.62);--color-secondary-400:oklch(67.5% .16 259.73);--color-secondary-500:oklch(62.31% .19 259.81);--color-secondary-600:oklch(56.67% .17 259.62);--color-secondary-700:oklch(50.88% .15 259.38);--color-secondary-800:oklch(45.27% .14 259.05);--color-secondary-900:oklch(39.12% .12 258.61);--color-secondary-950:oklch(32.73% .1 257.99);--color-secondary-contrast-dark:var(--color-secondary-950);--color-secondary-contrast-light:var(--color-secondary-50);--color-secondary-contrast-50:var(--color-secondary-contrast-dark);--color-secondary-contrast-100:var(--color-secondary-contrast-dark);--color-secondary-contrast-200:var(--color-secondary-contrast-dark);--color-secondary-contrast-300:var(--color-secondary-contrast-dark);--color-secondary-contrast-400:var(--color-secondary-contrast-dark);--color-secondary-contrast-500:var(--color-secondary-contrast-dark);--color-secondary-contrast-600:var(--color-secondary-contrast-light);--color-secondary-contrast-700:var(--color-secondary-contrast-light);--color-secondary-contrast-800:var(--color-secondary-contrast-light);--color-secondary-contrast-900:var(--color-secondary-contrast-light);--color-secondary-contrast-950:var(--color-secondary-contrast-light);--color-tertiary-50:oklch(90.9% .05 308.41);--color-tertiary-100:oklch(84.93% .09 307.99);--color-tertiary-200:oklch(78.99% .13 306.89);--color-tertiary-300:oklch(73.11% .17 306.64);--color-tertiary-400:oklch(67.63% .2 305.25);--color-tertiary-500:oklch(62.68% .23 303.91);--color-tertiary-600:oklch(57.13% .21 304.11);--color-tertiary-700:oklch(51.32% .19 303.9);--color-tertiary-800:oklch(45.54% .16 304.3);--color-tertiary-900:oklch(39.39% .13 304.01);--color-tertiary-950:oklch(33.13% .1 304.38);--color-tertiary-contrast-dark:var(--color-tertiary-950);--color-tertiary-contrast-light:var(--color-tertiary-50);--color-tertiary-contrast-50:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-100:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-200:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-300:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-400:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-500:var(--color-tertiary-contrast-dark);--color-tertiary-contrast-600:var(--color-tertiary-contrast-light);--color-tertiary-contrast-700:var(--color-tertiary-contrast-light);--color-tertiary-contrast-800:var(--color-tertiary-contrast-light);--color-tertiary-contrast-900:var(--color-tertiary-contrast-light);--color-tertiary-contrast-950:var(--color-tertiary-contrast-light);--color-success-50:oklch(95.46% .05 135.76);--color-success-100:oklch(90.63% .09 136.23);--color-success-200:oklch(86.02% .14 136.64);--color-success-300:oklch(81.71% .18 137.18);--color-success-400:oklch(77.74% .21 138.01);--color-success-500:oklch(74.17% .23 139.28);--color-success-600:oklch(67.56% .21 139.23);--color-success-700:oklch(61.07% .19 139.23);--color-success-800:oklch(54.16% .16 139.07);--color-success-900:oklch(47.27% .14 139.07);--color-success-950:oklch(39.83% .12 139.03);--color-success-contrast-dark:var(--color-success-950);--color-success-contrast-light:var(--color-success-50);--color-success-contrast-50:var(--color-success-contrast-dark);--color-success-contrast-100:var(--color-success-contrast-dark);--color-success-contrast-200:var(--color-success-contrast-dark);--color-success-contrast-300:var(--color-success-contrast-dark);--color-success-contrast-400:var(--color-success-contrast-dark);--color-success-contrast-500:var(--color-success-contrast-dark);--color-success-contrast-600:var(--color-success-contrast-dark);--color-success-contrast-700:var(--color-success-contrast-light);--color-success-contrast-800:var(--color-success-contrast-light);--color-success-contrast-900:var(--color-success-contrast-light);--color-success-contrast-950:var(--color-success-contrast-light);--color-warning-50:oklch(97.2% .03 94.02);--color-warning-100:oklch(94.07% .07 92.41);--color-warning-200:oklch(91.26% .1 92.56);--color-warning-300:oklch(88.49% .13 90.94);--color-warning-400:oklch(85.95% .15 90.22);--color-warning-500:oklch(83.38% .16 87.97);--color-warning-600:oklch(76.76% .15 88.43);--color-warning-700:oklch(70% .13 89.01);--color-warning-800:oklch(63.39% .12 89.83);--color-warning-900:oklch(56.27% .11 90.82);--color-warning-950:oklch(48.93% .09 92.19);--color-warning-contrast-dark:var(--color-warning-950);--color-warning-contrast-light:var(--color-warning-50);--color-warning-contrast-50:var(--color-warning-contrast-dark);--color-warning-contrast-100:var(--color-warning-contrast-dark);--color-warning-contrast-200:var(--color-warning-contrast-dark);--color-warning-contrast-300:var(--color-warning-contrast-dark);--color-warning-contrast-400:var(--color-warning-contrast-dark);--color-warning-contrast-500:var(--color-warning-contrast-dark);--color-warning-contrast-600:var(--color-warning-contrast-dark);--color-warning-contrast-700:var(--color-warning-contrast-light);--color-warning-contrast-800:var(--color-warning-contrast-light);--color-warning-contrast-900:var(--color-warning-contrast-light);--color-warning-contrast-950:var(--color-warning-contrast-light);--color-error-50:oklch(91.53% .03 354.83);--color-error-100:oklch(82.96% .06 357.86);--color-error-200:oklch(74.51% .09 359.04);--color-error-300:oklch(66.39% .12 1.65);--color-error-400:oklch(58.7% .15 3.98);--color-error-500:oklch(51.95% .17 8.24);--color-error-600:oklch(47.94% .16 8.02);--color-error-700:oklch(44.05% .15 7.39);--color-error-800:oklch(39.86% .13 7);--color-error-900:oklch(35.77% .12 6.01);--color-error-950:oklch(31.35% .1 5.2);--color-error-contrast-dark:var(--color-error-950);--color-error-contrast-light:var(--color-error-50);--color-error-contrast-50:var(--color-error-contrast-dark);--color-error-contrast-100:var(--color-error-contrast-dark);--color-error-contrast-200:var(--color-error-contrast-dark);--color-error-contrast-300:var(--color-error-contrast-dark);--color-error-contrast-400:var(--color-error-contrast-light);--color-error-contrast-500:var(--color-error-contrast-light);--color-error-contrast-600:var(--color-error-contrast-light);--color-error-contrast-700:var(--color-error-contrast-light);--color-error-contrast-800:var(--color-error-contrast-light);--color-error-contrast-900:var(--color-error-contrast-light);--color-error-contrast-950:var(--color-error-contrast-light);--color-surface-50:oklch(93.67% .01 264.6);--color-surface-100:oklch(86.3% .01 264.53);--color-surface-200:oklch(78.92% .02 256.3);--color-surface-300:oklch(71.27% .03 259.82);--color-surface-400:oklch(63.53% .03 256.06);--color-surface-500:oklch(55.44% .04 257.42);--color-surface-600:oklch(51.28% .04 256.82);--color-surface-700:oklch(46.75% .03 257.79);--color-surface-800:oklch(42.39% .03 257.09);--color-surface-900:oklch(37.62% .03 258.36);--color-surface-950:oklch(33.01% .03 257.52);--color-surface-contrast-dark:var(--color-surface-950);--color-surface-contrast-light:var(--color-surface-50);--color-surface-contrast-50:var(--color-surface-contrast-dark);--color-surface-contrast-100:var(--color-surface-contrast-dark);--color-surface-contrast-200:var(--color-surface-contrast-dark);--color-surface-contrast-300:var(--color-surface-contrast-dark);--color-surface-contrast-400:var(--color-surface-contrast-dark);--color-surface-contrast-500:var(--color-surface-contrast-light);--color-surface-contrast-600:var(--color-surface-contrast-light);--color-surface-contrast-700:var(--color-surface-contrast-light);--color-surface-contrast-800:var(--color-surface-contrast-light);--color-surface-contrast-900:var(--color-surface-contrast-light);--color-surface-contrast-950:var(--color-surface-contrast-light)}[data-theme=crimson],[data-theme=vintage],[data-theme=sahara],[data-theme=rocket]{--radius-base:0rem;--animate-wiggle:wiggle 1s ease-in-out infinite}:is([data-theme=crimson],[data-theme=vintage],[data-theme=sahara],[data-theme=rocket]) ::-moz-selection{background-color:var(--color-primary-500);color:var(--color-primary-contrast-500);font-weight:bolder}:is([data-theme=crimson],[data-theme=vintage],[data-theme=sahara],[data-theme=rocket]) ::selection{background-color:var(--color-primary-500);color:var(--color-primary-contrast-500);font-weight:bolder}:is([data-theme=crimson],[data-theme=vintage],[data-theme=sahara],[data-theme=rocket]) pre{background-color:var(--color-surface-950)!important;color:var(--color-surface-contrast-950)!important}.animate-ping{animation:var(--animate-ping)}.animate-pulse{animation:var(--animate-pulse)}@keyframes spin{to{transform:rotate(360deg)}}@keyframes ping{75%,to{opacity:0;transform:scale(2)}}@keyframes pulse{50%{opacity:.5}}@keyframes bounce{0%,to{animation-timing-function:cubic-bezier(.8,0,1,1);transform:translateY(-25%)}50%{animation-timing-function:cubic-bezier(0,0,.2,1);transform:none}}@keyframes wiggle{0%,to{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}@property --tw-translate-x{syntax:"*";inherits:false;initial-value:0}@property --tw-translate-y{syntax:"*";inherits:false;initial-value:0}@property --tw-translate-z{syntax:"*";inherits:false;initial-value:0}@property --tw-rotate-x{syntax:"*";inherits:false;initial-value:rotateX(0)}@property --tw-rotate-y{syntax:"*";inherits:false;initial-value:rotateY(0)}@property --tw-rotate-z{syntax:"*";inherits:false;initial-value:rotateZ(0)}@property --tw-skew-x{syntax:"*";inherits:false;initial-value:skewX(0)}@property --tw-skew-y{syntax:"*";inherits:false;initial-value:skewY(0)}@property --tw-space-y-reverse{syntax:"*";inherits:false;initial-value:0}@property --tw-space-x-reverse{syntax:"*";inherits:false;initial-value:0}@property --tw-border-style{syntax:"*";inherits:false;initial-value:solid}@property --tw-leading{syntax:"*";inherits:false}@property --tw-font-weight{syntax:"*";inherits:false}@property --tw-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-shadow-color{syntax:"*";inherits:false}@property --tw-inset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-inset-shadow-color{syntax:"*";inherits:false}@property --tw-ring-color{syntax:"*";inherits:false}@property --tw-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-inset-ring-color{syntax:"*";inherits:false}@property --tw-inset-ring-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-ring-inset{syntax:"*";inherits:false}@property --tw-ring-offset-width{syntax:"<length>";inherits:false;initial-value:0}@property --tw-ring-offset-color{syntax:"*";inherits:false;initial-value:#fff}@property --tw-ring-offset-shadow{syntax:"*";inherits:false;initial-value:0 0 #0000}@property --tw-blur{syntax:"*";inherits:false}@property --tw-brightness{syntax:"*";inherits:false}@property --tw-contrast{syntax:"*";inherits:false}@property --tw-grayscale{syntax:"*";inherits:false}@property --tw-hue-rotate{syntax:"*";inherits:false}@property --tw-invert{syntax:"*";inherits:false}@property --tw-opacity{syntax:"*";inherits:false}@property --tw-saturate{syntax:"*";inherits:false}@property --tw-sepia{syntax:"*";inherits:false}@property --tw-drop-shadow{syntax:"*";inherits:false}@property --tw-backdrop-blur{syntax:"*";inherits:false}@property --tw-backdrop-brightness{syntax:"*";inherits:false}@property --tw-backdrop-contrast{syntax:"*";inherits:false}@property --tw-backdrop-grayscale{syntax:"*";inherits:false}@property --tw-backdrop-hue-rotate{syntax:"*";inherits:false}@property --tw-backdrop-invert{syntax:"*";inherits:false}@property --tw-backdrop-opacity{syntax:"*";inherits:false}@property --tw-backdrop-saturate{syntax:"*";inherits:false}@property --tw-backdrop-sepia{syntax:"*";inherits:false}@property --tw-duration{syntax:"*";inherits:false}@property --tw-ease{syntax:"*";inherits:false}';
class Ma {
  constructor(o, t, a) {
    w(this, "id");
    w(this, "message");
    w(this, "type");
    this.id = o, this.message = t, this.type = a;
  }
}
var at = /* @__PURE__ */ ((r) => (r.SUCCESS = "success", r.ERROR = "error", r.WARNING = "warning", r.INFO = "info", r))(at || {});
const ct = Sa([]);
function Oa(r, o = "success", t = 3e3) {
  const a = Date.now();
  ct.update((c) => [...c, new Ma(a, r, o)]), setTimeout(() => Pa(a), t);
}
function Pa(r) {
  ct.update((o) => o.filter((t) => t.id !== r));
}
class Fa extends st {
  /**
   * Initializes a new instance of the BFlowRunnerAgentMessenger class.
   * Sets the agent subject to 'bflow-to-bflowviz'.
   * 
   * @param {Partial<{ connection: AgentConnection }>} config - The configuration object containing the agent connection.
   */
  constructor(t) {
    super({ connection: t.connection, subject: t.subject ?? "file-uploader" });
    w(this, "onProcessCallback");
    this.onProcessCallback = t.onProcess ?? (() => (console.log(">>>> call fallback function"), {}));
  }
  /**
   * This method is not implemented and will throw an error if called.
   * 
   * @param {InPayload} payload - The input payload containing the BFlow data to be processed.
   * @returns {Promise<OutPayload>} - A promise that resolves to the output payload containing the BFlowViz data.
   * @async
   * @protected
   */
  async process(t) {
    return this.onProcessCallback(t);
  }
}
var vr;
class Ia {
  constructor(o, t, a) {
    w(this, "servers", "");
    w(this, "token", "");
    w(this, "subject");
    w(this, "agentConnection");
    w(this, "fileUploadAgentMessenger");
    kr(this, vr, $o(!0));
    this.servers = o, this.token = t, this.subject = a;
  }
  get modalShow() {
    return z(x(this, vr));
  }
  set modalShow(o) {
    T(x(this, vr), ar(o));
  }
  async connect() {
    try {
      this.agentConnection = new it({ name: "file-uploader" }), await this.agentConnection.connect({ servers: this.servers, token: this.token }), this.fileUploadAgentMessenger = new Fa({
        connection: this.agentConnection,
        subject: this.subject,
        onProcess: this.onProcess
      }), await this.fileUploadAgentMessenger.start();
    } catch (o) {
      console.error(o);
    }
  }
  async disconnect() {
    var o, t;
    try {
      await ((o = this.fileUploadAgentMessenger) == null ? void 0 : o.stop()), await ((t = this.agentConnection) == null ? void 0 : t.stop());
    } catch {
    }
  }
  onProcess(o) {
    return console.log(">>> Controller is here"), this.modalShow = !0, {};
  }
  upload(o) {
    var t;
    this.modalShow = !1, (t = this.fileUploadAgentMessenger) == null || t.publish({ data: o });
  }
}
vr = new WeakMap();
var Da = (r, o) => o(), La = /* @__PURE__ */ ga('<!> <main><div class="max-w-md mx-auto p-6 bg-white"><h2 class="text-xl font-semibold text-gray-700 mb-4">Upload Your File for Processing</h2> <p class="text-gray-600 mb-4">Please upload the required file to continue processing your request.</p> <form><div class="mb-4"><label for="file-input" class="block text-sm font-medium text-gray-700">Choose a file</label> <input class="input mt-1 w-full" type="text "></div> <button type="button" class="btn preset-filled-primary-500 w-full py-2 hover:preset-filled-primary-300 transition">Upload File</button></form></div></main>');
function Ua(r, o) {
  Vo(o, !0);
  let t = _r(o, "servers"), a = _r(o, "token"), c = _r(o, "subject"), e = _r(o, "theme", 7, "crimson"), n = new Ia(t(), a(), c()), s = $o("");
  ot(async () => {
    try {
      await n.connect();
    } catch (b) {
      console.error(b);
    }
  }), Ca(async () => {
    try {
      await n.disconnect();
    } catch (b) {
      console.error(b);
    }
  });
  const i = async () => {
    if (!z(s)) {
      Oa("Please select a file to upload", at.ERROR);
      return;
    }
    n.upload("File content is coming soon!");
  };
  var l = La(), u = so(l);
  ma(u, () => "style", !1, (b, G) => {
    var O = pa(), et = so(O);
    wa(et, () => Ra), Wr(G, O);
  });
  var h = br(u, 2), d = mr(h), f = br(mr(d), 4), v = mr(f), m = br(mr(v), 2);
  _a(m), wr(v);
  var B = br(v, 2);
  return B.__click = [Da, i], wr(f), wr(d), wr(h), ca(() => Xr(h, "data-theme", e())), Ea(m, () => z(s), (b) => T(s, b)), Wr(r, l), Wo({
    get servers() {
      return t();
    },
    set servers(b) {
      t(b), dr();
    },
    get token() {
      return a();
    },
    set token(b) {
      a(b), dr();
    },
    get subject() {
      return c();
    },
    set subject(b) {
      c(b), dr();
    },
    get theme() {
      return e();
    },
    set theme(b = "crimson") {
      e(b), dr();
    }
  });
}
va(["click"]);
customElements.define("file-uploader", ja(
  Ua,
  {
    servers: {},
    token: {},
    subject: {},
    theme: {}
  },
  [],
  [],
  !0
));
export {
  Ua as FileUploader
};
