import { describe, expect, it, vi } from "vitest";
import { getDataTest, PassData } from "../App.tsx";
import { invoke } from "@tauri-apps/api/core";
import {render, screen} from "@testing-library/react";
import "@testing-library/react"
import "@testing-library/jest-dom"
import userEvent from "@testing-library/user-event"
import { open, save, ask } from '@tauri-apps/plugin-dialog';

import Import, * as addFromCSV from '../components/Import.tsx';
import Export, { saveToFile } from "../components/Export.tsx";
import DataDetail, { deletePass } from "../components/DataCard/DataDetail.tsx";
import { beforeEach } from "node:test";

vi.mock('@tauri-apps/plugin-dialog', () => ({
    open: vi.fn(),
    save: vi.fn(),
    ask: vi.fn()
  })
);

vi.mock('@tauri-apps/api/core', () => ({
    invoke: vi.fn()
}))
  
beforeEach(() => {
    Object.defineProperty(globalThis.navigator, 'clipboard', {
        value: {
            writeText: vi.fn().mockResolvedValue(undefined)
        },
        writable: true
    })
})


// Backend invoke functions
describe("Invoke necessary functions", () => {

    it("Should get passwords response", () => {
        expect(getDataTest).toBeOneOf([] as PassData[]); //returns passwords.
    });


    it("should add password via frontend", async () => {
        render(<Import/>)

        const button = screen.getByText("Import");

        const mockFilePath = '/path/to/file.csv';
        
        await userEvent.click(button);

        vi.mocked(open).mockResolvedValue(mockFilePath);

        const openM = await open({
            filters: [{
                name: 'Comma Separated Values',
                extensions: ['csv']
            }]
        });

        const result = await addFromCSV.getFile();

       expect(result).toEqual(openM)
    });

    it("should export passwords into a CSV file.", async () => {
        render(<Export/>)
        
        const button = screen.getByText("Export");
        await userEvent.click(button);

        const mockFilePath = '/path/to/file.csv';

        vi.mocked(save).mockResolvedValue(mockFilePath)

        const saveFile = await save({
            filters: [{
                name: 'Comma Separated Values',
                extensions: ['csv']
            }]
        });
        
        const result = await saveToFile();

        expect(result).toEqual(saveFile);
    });

    it("Should perform all functions for Data card.", async () => {
        render(<DataDetail id={1} username="billy" password="gjdgbjjdhgjl" url="despacito.com" favorite={0} key={1} editMode={true}/>)

        const deleteBttn = screen.getByTestId("delete-bttn");

        await userEvent.click(deleteBttn);

        expect(deleteBttn).toBeInTheDocument();

        vi.resetAllMocks();
    })

});

describe("Delete button w/ deleteFunction", () => {

    it('should render button in document', async () => {
        render(<DataDetail id={1} username="billy" password="gjdgbjjdhgjl" url="despacito.com" favorite={0} key={1} editMode={true}/>)

        const deleteBttn = screen.getByTestId("delete-bttn");

        await userEvent.click(deleteBttn);

        expect(deleteBttn).toBeInTheDocument();

        vi.resetAllMocks();
    })

    it("Edit mode disabled should not have the delete button be in view", async () => {
        render(<DataDetail id={1} username="billy" password="gjdgbjjdhgjl" url="despacito.com" favorite={0} key={1} editMode={false}/>)

        const deleteBttn = screen.getByTestId("delete-bttn");

        expect(deleteBttn).not.toBeVisible();
    })


    it('should not delete password when user does NOT confirm "yes"', async () => {
        vi.mocked(ask).mockResolvedValue(false);
        const result = await deletePass(12);

        expect(invoke).not.toHaveBeenCalled();
        expect(result).toBeUndefined();
    })

    it('should delete password @ id and return a message of success when user presses "yes".', async () => {
        vi.mocked(ask).mockResolvedValue(true)
        vi.mocked(invoke).mockResolvedValue(undefined);

        const result = await deletePass(12);

        expect(ask).toHaveBeenCalledWith('Are you sure you want to delete this password? This action cannot be undone.', {title: "Delete Password", kind: "warning"});

        expect(invoke).toHaveBeenCalledWith('delete_pw', {id: 12});
        expect(result).toBe("password has deleted successfully!");
    })
})

// describe("Copy paste button w/ copy and paste function", () => {

//     it('should copy & paste the unencrypted password', async () => {
        
//         render(<DataDetail id={1} username="billy" password="gjdgbjjdhgjl" url="despacito.com" favorite={0} key={1} editMode={true}/>)
//         const user = userEvent.setup();
//         const button = screen.getByTestId('copy-paste-bttn');

//         await user.click(button);
//         expect(navigator.clipboard.writeText).toHaveBeenCalledWith("gjdgbjjdhgjl");
//     })


//     // it('should copy & paste the unencrypted password', async () => {
//     //     render(<DataDetail id={1} username="billy" password="gjdgbjjdhgjl" url="despacito.com" favorite={0} key={1} editMode={true}/>)

//     //     const clipboardMock = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue();
//     //     const user = userEvent.setup();
//     //     const button = screen.getByTestId('copy-paste-bttn');

//     //     fireEvent.click(button);
//     //     expect(clipboardMock).toHaveBeenCalledWith("gjdgbjjdhgjl")
//     // })

// })

// describe("Add password w/ submit", () => {
//     it("should submit password successfully", async () => {
//         render(<AddForm viewModal={false} setModal={() => {}}/>)

//         const submitPW = vi.fn();

//         const nameInput = screen.getByTestId("username");
//         const passwordInput = screen.getByTestId("password");
//         const urlInput = screen.getByTestId("url");

//         const submitButton = screen.getByText("Add", {selector: 'button'});

//         const mock = {
//             username: "Carl",
//             password: "gekgkekge",
//             url: "ilovellamas.org",
//             favorite: 0
//         };

//         await userEvent.type(nameInput, mock.username);
//         await userEvent.type(passwordInput, mock.password);
//         await userEvent.type(urlInput, mock.url);

//         userEvent.click(submitButton);

//         expect(submitPW).toHaveBeenCalledTimes(1);
//         expect(submitPW).toHaveBeenCalledWith({
//             username: "Carl",
//             password: "gekgkekge",
//             url: "ilovellamas.org",
//             favorite: 0
//         });
//     })
// })