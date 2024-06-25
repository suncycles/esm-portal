/**
 * Copyright (c) 2019 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 */
// Primitives discribing a compartment
export var CompartmentPrimitiveType;
(function (CompartmentPrimitiveType) {
    CompartmentPrimitiveType[CompartmentPrimitiveType["MetaBall"] = 0] = "MetaBall";
    CompartmentPrimitiveType[CompartmentPrimitiveType["Sphere"] = 1] = "Sphere";
    CompartmentPrimitiveType[CompartmentPrimitiveType["Cube"] = 2] = "Cube";
    CompartmentPrimitiveType[CompartmentPrimitiveType["Cylinder"] = 3] = "Cylinder";
    CompartmentPrimitiveType[CompartmentPrimitiveType["Cone"] = 4] = "Cone";
    CompartmentPrimitiveType[CompartmentPrimitiveType["Plane"] = 5] = "Plane";
    CompartmentPrimitiveType[CompartmentPrimitiveType["None"] = 6] = "None";
})(CompartmentPrimitiveType || (CompartmentPrimitiveType = {}));
