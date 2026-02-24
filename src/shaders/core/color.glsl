/**
  Sample a 6-lobed sphere linear color.
  Sort of like a cubemap, but with 6 colors instead of 6 faces.
  Adjust sharpness to change the shape of the lobes. (higher values make it look more like a cubemap with sharper edges between colors)
*/
vec3 sample6LobesSphereLinear(vec3 dir,
                              vec3 colPosX, vec3 colNegX,
                              vec3 colPosY, vec3 colNegY,
                              vec3 colPosZ, vec3 colNegZ,
                              float sharpness)
{
    float len2 = dot(dir, dir);
    if (len2 < 1e-12) return colPosZ;
    dir *= inversesqrt(len2);

    float wxp = pow(max( dir.x, 0.0), sharpness);
    float wxn = pow(max(-dir.x, 0.0), sharpness);
    float wyp = pow(max( dir.y, 0.0), sharpness);
    float wyn = pow(max(-dir.y, 0.0), sharpness);
    float wzp = pow(max( dir.z, 0.0), sharpness);
    float wzn = pow(max(-dir.z, 0.0), sharpness);

    float wSum = max(wxp + wxn + wyp + wyn + wzp + wzn, 1e-8);

    return (colPosX * wxp + colNegX * wxn +
            colPosY * wyp + colNegY * wyn +
            colPosZ * wzp + colNegZ * wzn) / wSum;
}