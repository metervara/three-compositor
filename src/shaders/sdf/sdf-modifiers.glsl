// #pragma once

// https://iquilezles.org/articles/distfunctions/
/*
float opElongate( in sdf3d primitive, in vec3 p, in vec3 h )
{
    vec3 q = p - clamp( p, -h, h );
    return primitive( q );
}

float opElongate( in sdf3d primitive, in vec3 p, in vec3 h )
{
    vec3 q = abs(p)-h;
    return primitive( max(q,0.0) ) + min(max(q.x,max(q.y,q.z)),0.0);
}
*/
float opRound( float d, float rad )
{
    return d - rad;
}
/*
float opOnion( in float sdf, in float thickness )
{
    return abs(sdf)-thickness;
}

float length2( vec3 p ) { p=p*p; return sqrt( p.x+p.y+p.z); }

float length6( vec3 p ) { p=p*p*p; p=p*p; return pow(p.x+p.y+p.z,1.0/6.0); }

float length8( vec3 p ) { p=p*p; p=p*p; p=p*p; return pow(p.x+p.y+p.z,1.0/8.0); }
*/
float opUnion( float d1, float d2 )
{
    return min(d1,d2);
}
float opSubtraction( float d1, float d2 )
{
    return max(-d1,d2);
}
float opIntersection( float d1, float d2 )
{
    return max(d1,d2);
}
float opXor(float d1, float d2 )
{
    return max(min(d1,d2),-max(d1,d2));
}

float opSmoothUnion( float d1, float d2, float k )
{
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);
}

float opSmoothSubtraction( float d1, float d2, float k )
{
    float h = clamp( 0.5 - 0.5*(d2+d1)/k, 0.0, 1.0 );
    return mix( d2, -d1, h ) + k*h*(1.0-h);
}

float opSmoothIntersection( float d1, float d2, float k )
{
    float h = clamp( 0.5 - 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) + k*h*(1.0-h);
}
/*
// Move and rotate
vec3 opTx( in vec3 p, in transform t, in sdf3d primitive )
{
    return primitive( invert(t)*p );
}

float opScale( in vec3 p, in float s, in sdf3d primitive )
{
    return primitive(p/s)*s;
}

// Repetition
float opRepetition( in vec3 p, in vec3 s, in sdf3d primitive )
{
    vec3 q = p - s*round(p/s);
    return primitive( q );
}

vec3 opLimitedRepetition( in vec3 p, in float s, in vec3 l, in sdf3d primitive )
{
    vec3 q = p - s*clamp(round(p/s),-l,l);
    return primitive( q );
}

float opTwist( in sdf3d primitive, in vec3 p )
{
    const float k = 10.0; // or some other amount
    float c = cos(k*p.y);
    float s = sin(k*p.y);
    mat2  m = mat2(c,-s,s,c);
    vec3  q = vec3(m*p.xz,p.y);
    return primitive(q);
}

float opCheapBend( in sdf3d primitive, in vec3 p )
{
    const float k = 10.0; // or some other amount
    float c = cos(k*p.x);
    float s = sin(k*p.x);
    mat2  m = mat2(c,-s,s,c);
    vec3  q = vec3(m*p.xy,p.z);
    return primitive(q);
}
*/