import { QueryResult } from "../../../src";
import { MainEntity, Entity1 } from "../../entities/entitiesAttributeEntities";

import { assert } from "chai";
import sinon from "sinon";

const sandbox = sinon.sandbox.create();

describe("save and delete entities attribute test", () => {
    afterEach(() => sandbox.restore());

    it("should replace entities if direct assign was made or correctly update the list otherwise", async () => {
        let entityFindById = sandbox
            .stub(MainEntity.getDriver(), "findOne")
            .callsFake(() => new QueryResult({ id: "A" }));
        let entityFind = sandbox.stub(Entity1.getDriver(), "find").callsFake(() => {
            return new QueryResult([
                { id: "B", name: "b", type: "dog", markedAsCannotDelete: false },
                { id: "C", name: "c", type: "dog", markedAsCannotDelete: false }
            ]);
        });

        const mainEntity = await MainEntity.findById(123);
        entityFindById.restore();

        mainEntity.attribute1 = [{ name: "x", type: "parrot" }];

        assert.deepEqual(mainEntity.getAttribute("attribute1").value.state, {
            loading: false,
            loaded: false
        });

        assert.isEmpty(mainEntity.getAttribute("attribute1").value.initial);
        assert.equal(mainEntity.getAttribute("attribute1").value.current[0].name, "x");

        let entitySave = sandbox
            .stub(mainEntity.getDriver(), "save")
            .onCall(1)
            .callsFake(entity => {
                entity.id = "X";
                return new QueryResult();
            })
            .onCall(0)
            .callsFake(() => new QueryResult());

        await mainEntity.save();

        assert.deepEqual(mainEntity.getAttribute("attribute1").value.state, {
            loading: false,
            loaded: true
        });

        assert.lengthOf(mainEntity.getAttribute("attribute1").value.initial, 1);
        assert.equal(mainEntity.getAttribute("attribute1").value.initial[0].id, "X");
        assert.lengthOf(mainEntity.getAttribute("attribute1").value.current, 1);
        assert.equal(mainEntity.getAttribute("attribute1").value.current[0].id, "X");

        entitySave.restore();
        entityFind.restore();

        mainEntity.attribute1 = [{ name: "y", type: "dog" }, { name: "z", type: "parrot" }];

        assert.lengthOf(mainEntity.getAttribute("attribute1").value.initial, 1);
        assert.equal(mainEntity.getAttribute("attribute1").value.initial[0].id, "X");
        assert.lengthOf(mainEntity.getAttribute("attribute1").value.current, 2);
        assert.equal(mainEntity.getAttribute("attribute1").value.current[0].name, "y");
        assert.equal(mainEntity.getAttribute("attribute1").value.current[1].name, "z");

        entitySave = sandbox
            .stub(mainEntity.getDriver(), "save")
            .onCall(1)
            .callsFake(entity => {
                entity.id = "Y";
                return new QueryResult();
            })
            .onCall(2)
            .callsFake(entity => {
                entity.id = "Z";
                return new QueryResult();
            })
            .onCall(0)
            .callsFake(() => new QueryResult());

        await mainEntity.save();

        assert.lengthOf(mainEntity.getAttribute("attribute1").value.initial, 2);
        assert.equal(mainEntity.getAttribute("attribute1").value.initial[0].id, "Y");
        assert.equal(mainEntity.getAttribute("attribute1").value.initial[1].id, "Z");
        assert.lengthOf(mainEntity.getAttribute("attribute1").value.current, 2);
        assert.equal(mainEntity.getAttribute("attribute1").value.current[0].id, "Y");
        assert.equal(mainEntity.getAttribute("attribute1").value.current[1].id, "Z");

        entitySave.restore();

        mainEntity.attribute1 = null;
        assert.lengthOf(mainEntity.getAttribute("attribute1").value.initial, 2);
        assert.equal(mainEntity.getAttribute("attribute1").value.initial[0].id, "Y");
        assert.equal(mainEntity.getAttribute("attribute1").value.initial[1].id, "Z");

        assert.isNull(mainEntity.getAttribute("attribute1").value.current);
    });
});